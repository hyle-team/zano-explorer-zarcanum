import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import axios from 'axios';
import path, { dirname } from 'path';
import { fn, literal, Op, Sequelize } from 'sequelize';
import BigNumber from 'bignumber.js';
import next from 'next';
import { rateLimit } from 'express-rate-limit';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { WhitelistedAsset } from '@/interfaces/state/Asset';
import QueryString from 'qs';
import TransactionDataType from '@/interfaces/state/Transasction';
import exceptionHandler from './exceptionHandler';
import initDB from './database/initdb';
import sequelize from './database/sequelize';
import {
	log,
	config,
	ZANO_ASSET_ID,
	parseComment,
	parseTrackingKey,
	decodeString,
	pause,
} from './utils/utils';
import {
	blockInfo,
	lastBlock,
	setLastBlock,
	state,
	setState,
	setBlockInfo,
	PriceData,
} from './utils/states';
import {
	emitSocketInfo,
	getBlocksDetails,
	getMainBlockDetails,
	getTxPoolDetails,
	getVisibilityInfo,
} from './utils/methods';
import AltBlock from './schemes/AltBlock';
import Transaction from './schemes/Transaction';
import OutInfo, { IOutInfo } from './schemes/OutInfo';
import Block, { IBlock } from './schemes/Block';
import Alias from './schemes/Alias';
import Chart, { IChart } from './schemes/Chart';
import {
	get_all_pool_tx_list,
	get_alt_blocks_details,
	get_blocks_details,
	get_info,
	get_out_info,
	get_pool_txs_details,
	get_tx_details,
} from './utils/zanod';
import Pool from './schemes/Pool';
import Asset, { IAsset } from './schemes/Asset';
import { ITransaction } from './schemes/Transaction';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });

const handle = nextApp.getRequestHandler();

const app = express();
const server = http.createServer(app);

export const io = new Server(server, { transports: ['websocket', 'polling'] });

const requestsLimiter = rateLimit({
	windowMs: 5 * 1000,
	limit: 1,
	standardHeaders: 'draft-7',
	legacyHeaders: false,
});

let dbInited = false;

(async () => {
	await initDB();
	await sequelize.authenticate();
	await sequelize.sync();

	dbInited = true;
})();

async function waitForDb() {
	while (!dbInited) {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
}

(async () => {
	await waitForDb();

	io.engine.on('initial_headers', (headers) => {
		const newHeaders = { ...headers, 'Access-Control-Allow-Origin': config.frontend_api };
		Object.assign(headers, newHeaders);
	});

	io.engine.on('headers', (headers) => {
		const newHeaders = { ...headers, 'Access-Control-Allow-Origin': config.frontend_api };
		Object.assign(headers, newHeaders);
	});

	await nextApp.prepare();

	app.use(express.static('dist'));
	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header(
			'Access-Control-Allow-Headers',
			'Origin, X-Requested-With, Content-Type, Accept',
		);
		next();
	});
	app.use(express.static(path.resolve(__dirname, '../build/')));

	app.use(bodyParser.json());

	app.use(['/api/find_outs_in_recent_blocks'], requestsLimiter);

	// app.use("*", (req, res, next) => {
	//     console.log(`Request path: ${req.path}`);
	//     next();

	// });

	app.get(
		'/api/find_outs_in_recent_blocks',
		exceptionHandler(async (req, res) => {
			const { address } = req.query;
			const { viewkey } = req.query;
			const limit = req.query.limit || 5;

			if (!address) {
				return res.status(400).json({ error: 'Address is required' });
			}

			if (!viewkey) {
				return res.status(400).json({ error: 'Viewkey is required' });
			}

			const response = await axios({
				method: 'get',
				url: config.api,
				data: {
					method: 'find_outs_in_recent_blocks',
					params: {
						address,
						viewkey,
						blocks_limit: limit,
					},
				},
			});
			res.json(response.data);
		}),
	);

	app.get(
		'/api/get_info/:flags',
		exceptionHandler(async (req, res) => {
			const { flags } = req.params;
			const response = await axios({
				method: 'get',
				url: config.api,
				data: {
					method: 'getinfo',
					params: { flags: parseInt(flags) },
				},
			});
			res.json(response.data);
		}),
	);

	app.get(
		'/api/get_asset_supply',
		exceptionHandler(async (req, res) => {
			const response = await axios({
				method: 'get',
				url: config.api,
				data: {
					method: 'get_asset_info',
					params: {
						asset_id: req.query.asset_id || '',
					},
				},
			});

			res.json(
				response?.data?.result?.asset_descriptor?.current_supply || 'Error fetching supply',
			);
		}),
	);

	app.get(
		'/api/get_total_coins',
		exceptionHandler(async (req, res) => {
			const response = await axios({
				method: 'get',
				url: config.api,
				data: {
					method: 'getinfo',
					params: { flags: parseInt('4294967295') },
				},
			});

			const str = response.data.result.total_coins;
			let result: number | undefined;

			const totalCoins = Number(str);
			if (typeof totalCoins === 'number') {
				result = parseInt(totalCoins.toString()) / 1000000000000;
			}
			const r2 = result?.toFixed(2);
			res.send(r2);
		}),
	);

	app.get(
		'/api/get_main_block_details/:id',
		exceptionHandler(async (req, res) => {
			try {
				const id = req.params.id.toLowerCase();
				if (id) {
					const result = await getMainBlockDetails(id);
					return res.json(result || 'Block not found');
				}

				res.status(400).json({ error: 'Invalid parameters' });
			} catch (error) {
				console.log(error);
				res.status(500).json({ error: (error as { message: string }).message });
			}
		}),
	);

	app.get(
		'/api/ping',
		exceptionHandler(async (req, res) => {
			res.send('pong');
		}),
	);

	app.get(
		'/api/get_assets/:offset/:count',
		exceptionHandler(async (req, res) => {
			const offset = parseInt(req.params.offset, 10);
			const count = parseInt(req.params.count, 10);
			const searchText = req.query.search || '';

			if (!searchText) {
				// No searchText, fetch all assets with pagination
				const assets = await Asset.findAll({
					order: [['id', 'ASC']],
					limit: count,
					offset,
				});

				return res.send(assets);
			}

			// If there is searchText, count matching records
			const searchCondition = {
				[Op.or]: [
					{ ticker: { [Op.iLike]: `%${searchText}%` } },
					{ full_name: { [Op.iLike]: `%${searchText}%` } },
				],
			};

			const firstSearchRowCount = await Asset.count({
				where: searchCondition,
			});

			if (firstSearchRowCount > 0) {
				// Fetch records that match the searchText
				const assets = await Asset.findAll({
					where: searchCondition,
					order: [['id', 'ASC']],
					limit: count,
					offset,
				});

				return res.send(assets);
			}
			// If no matching records found, fetch by asset_id
			const assets = await Asset.findAll({
				where: { asset_id: searchText },
				limit: count,
				offset,
			});

			return res.send(assets);
		}),
	);

	const getWhitelistedAssets = async (
		offset: number,
		count: number,
		searchText?: string | QueryString.ParsedQs | string[] | QueryString.ParsedQs[],
	): Promise<WhitelistedAsset[]> => {
		const response = await axios.get<{ assets: WhitelistedAsset[] }>(
			config.assets_whitelist_url || 'https://api.zano.org/assets_whitelist_testnet.json',
		);

		if (!response.data.assets) {
			throw new Error('Assets whitelist response not correct');
		}

		const allAssets: WhitelistedAsset[] = response.data.assets;
		allAssets.unshift({
			asset_id: ZANO_ASSET_ID,
			logo: '',
			price_url: '',
			ticker: 'ZANO',
			full_name: 'Zano (Native)',
			total_max_supply: '0',
			current_supply: '0',
			decimal_point: 0,
			meta_info: '',
			price: 0,
		});

		const searchTextLower = String(searchText)?.toLowerCase();
		const filteredAssets = allAssets.filter((asset) =>
			searchText
				? asset.ticker.toLowerCase().includes(searchTextLower!) ||
					asset.full_name.toLowerCase().includes(searchTextLower!)
				: true,
		);

		if (filteredAssets.length > 0) {
			return filteredAssets.slice(offset, offset + count);
		}

		const dbAssets = await Asset.findAll({
			where: {
				asset_id: searchText,
			},
			limit: count,
			offset,
		});
		return dbAssets.map((asset) => asset.toJSON() as WhitelistedAsset);
	};

	app.get(
		'/api/get_whitelisted_assets/:offset/:count',
		exceptionHandler(async (req, res) => {
			const offset = parseInt(req.params.offset, 10);
			const count = parseInt(req.params.count, 10);
			const searchText = req.query.search || '';

			const assets = await getWhitelistedAssets(offset, count, searchText);
			res.send(assets);
		}),
	);

	app.get(
		'/api/get_aliases/:offset/:count/:search/:filter',
		exceptionHandler(async (req, res, next) => {
			const { offset, count, search, filter } = req.params;
			const limit = Math.min(parseInt(count), config.maxDaemonRequestCount);
			const parsedOffset = parseInt(offset);
			const searchTerm = search.toLowerCase();
			const premiumOnly = filter === 'premium';

			const whereClause: Record<string | symbol, unknown> = {
				enabled: true,
			};

			if (searchTerm !== 'all') {
				whereClause[Op.or] = [
					Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('alias')), {
						[Op.like]: `%${searchTerm.toLowerCase()}%`,
					}),
					Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('address')), {
						[Op.like]: `%${searchTerm.toLowerCase()}%`,
					}),
					Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('comment')), {
						[Op.like]: `%${searchTerm.toLowerCase()}%`,
					}),
				];
			}

			if (premiumOnly) {
				whereClause.alias = Sequelize.where(
					Sequelize.fn('CHAR_LENGTH', Sequelize.col('alias')),
					{
						[Op.lte]: 5,
					},
				);
			}

			try {
				const aliasesRow = await Alias.findAll({
					where: whereClause,
					order: [['block', 'DESC']],
					limit,
					offset: parsedOffset,
				});
				const aliasesAddresses = aliasesRow.map((aliasRow) => aliasRow.address);
				let registeredAddresses: string[] = [];
				try {
					const addressesHasMatrixConnectionResp = await axios({
						method: 'post',
						url: `${config.matrix_api_url}/get-addresses`,
						data: {
							addresses: aliasesAddresses,
						},
						transformResponse: [(data) => JSON.parse(data)],
					});
					const { addresses } = addressesHasMatrixConnectionResp.data;
					registeredAddresses = addresses
						.filter((address: { registered: boolean }) => address.registered === true)
						.map(({ address }: { address: string }) => address);
				} catch (e) {
					console.error(e);
				}
				const aliases = aliasesRow.map((aliasRow) => {
					const hasMatrixConnection = registeredAddresses.includes(aliasRow.address);
					return {
						...aliasRow.get({ plain: true }),
						hasMatrixConnection,
					};
				});

				res.json(aliases.length > 0 ? aliases : []);
			} catch (error) {
				next(error);
			}
		}),
	);

	async function fetchWhitelistedAssets() {
		const response = await axios({
			method: 'get',
			url:
				config.assets_whitelist_url || 'https://api.zano.org/assets_whitelist_testnet.json',
		});

		if (!response.data.assets) {
			throw new Error('Assets whitelist response not correct');
		}

		const allAssets = response.data.assets;

		return allAssets;
	}

	app.get(
		'/api/get_assets_count',
		exceptionHandler(async (req, res) => {
			const whitelistedAssets = await fetchWhitelistedAssets();
			const whitelistedAssetsAmount = whitelistedAssets.length + 1;

			const assetsAmount = await Asset.count();

			return res.json({ assetsAmount, whitelistedAssetsAmount });
		}),
	);

	app.get(
		'/api/get_aliases_count',
		exceptionHandler(async (req, res) => {
			const aliasesAmount = await Alias.count();
			const premiumAliasesAmount = await Alias.count({
				where: sequelize.where(sequelize.fn('LENGTH', sequelize.col('alias')), {
					[Op.lte]: 5,
				}),
			});
			return res.json({ aliasesAmount, premiumAliasesAmount });
		}),
	);

	app.get('/api/get_chart/:chart/:offset', async (req, res) => {
		const { chart, offset } = req.params;
		const offsetDate = parseInt(offset, 10) / 1000;

		if (!chart) {
			return res.status(400).json({ error: 'Invalid parameters' });
		}

		if (chart === 'AvgBlockSize') {
			console.log('loading AvgBlockSize');

			const result = await Chart.findAll({
				attributes: [
					[literal('"actual_timestamp" - ("actual_timestamp" % 3600)'), 'at'],
					[fn('avg', literal('"block_cumulative_size"::REAL')), 'bcs'],
				],
				group: ['at'],
				order: [[literal('"at"'), 'ASC']],
				where: {
					actual_timestamp: {
						[Op.gt]: offsetDate,
					},
				},
				raw: true,
			});

			res.send(result);
		} else if (chart === 'AvgTransPerBlock') {
			const result = await Chart.findAll({
				attributes: [
					[literal('"actual_timestamp" - ("actual_timestamp" % 3600)'), 'at'],
					[fn('avg', literal('"tr_count"::REAL')), 'trc'],
				],
				group: ['at'],
				order: [[literal('"at"'), 'ASC']],
				where: {
					actual_timestamp: {
						[Op.gt]: offsetDate,
					},
				},
				raw: true,
			});
			res.send(result);
		} else if (chart === 'hashRate') {
			console.time('hashRate');
			const result = await Chart.findAll({
				attributes: [
					[literal('"actual_timestamp" - ("actual_timestamp" % 3600)'), 'at'],
					[fn('avg', literal('"difficulty120"::REAL')), 'd120'],
					[fn('avg', literal('"hashrate100"::REAL')), 'h100'],
					[fn('avg', literal('"hashrate400"::REAL')), 'h400'],
				],
				group: ['at'],
				where: {
					type: '1',
					actual_timestamp: {
						[Op.gt]: offsetDate,
					},
				},
				order: [[literal('"at"'), 'ASC']],
				raw: true,
			});
			console.timeEnd('hashRate');
			res.send(result);
		} else if (chart === 'pos-difficulty') {
			// Aggregated data at 3600-second intervals
			const result = await Chart.findAll({
				attributes: [
					[literal('"actual_timestamp" - ("actual_timestamp" % 3600)'), 'at'],
					[
						literal(
							`CASE WHEN (MAX("difficulty"::NUMERIC) - AVG("difficulty"::NUMERIC)) > (AVG("difficulty"::NUMERIC) - MIN("difficulty"::NUMERIC)) THEN MAX("difficulty"::NUMERIC) ELSE MIN("difficulty"::NUMERIC) END`,
						),
						'd',
					],
				],
				group: ['at'],
				order: [[literal('"at"'), 'ASC']],
				where: {
					type: '0',
					actual_timestamp: {
						[Op.gt]: offsetDate,
					},
				},
				raw: true,
			});

			// Detailed data at 3600-second intervals using AVG
			const result1 = await Chart.findAll({
				attributes: [
					[literal('"actual_timestamp" - ("actual_timestamp" % 3600)'), 'at'],
					[fn('avg', literal('"difficulty"::NUMERIC')), 'd'],
				],
				group: ['at'],
				order: [[literal('"at"'), 'ASC']],
				where: {
					type: '0',
					actual_timestamp: {
						[Op.gt]: offsetDate,
					},
				},
				raw: true,
			});

			console.log('pos-difficulty', result1.length, result.length);
			res.send({
				aggregated: result,
				detailed: result1,
			});
		} else if (chart === 'pow-difficulty') {
			// Aggregated data at 3600-second intervals
			const result = await Chart.findAll({
				attributes: [
					[literal('"actual_timestamp" - ("actual_timestamp" % 3600)'), 'at'],
					[
						literal(
							`CASE WHEN (MAX("difficulty"::NUMERIC) - AVG("difficulty"::NUMERIC)) > (AVG("difficulty"::NUMERIC) - MIN("difficulty"::NUMERIC)) THEN MAX("difficulty"::NUMERIC) ELSE MIN("difficulty"::NUMERIC) END`,
						),
						'd',
					],
				],
				group: ['at'],
				order: [[literal('"at"'), 'ASC']],
				where: {
					type: '1',
					actual_timestamp: {
						[Op.gt]: offsetDate,
					},
				},
				raw: true,
			});

			// Detailed data at 3600-second intervals using AVG
			const result1 = await Chart.findAll({
				attributes: [
					[literal('"actual_timestamp" - ("actual_timestamp" % 3600)'), 'at'],
					[fn('avg', literal('"difficulty"::REAL')), 'd'],
				],
				group: ['at'],
				order: [[literal('"at"'), 'ASC']],
				where: {
					type: '1',
					actual_timestamp: {
						[Op.gt]: offsetDate,
					},
				},
				raw: true,
			});

			res.send({
				aggregated: result,
				detailed: result1,
			});
		} else if (chart === 'ConfirmTransactPerDay') {
			const offsetDateStartOfDay = new Date(offsetDate);
			offsetDateStartOfDay.setHours(0, 0, 0, 0);

			// Group by day (86400-second intervals)
			const result = await Chart.findAll({
				attributes: [
					[literal('"actual_timestamp" - ("actual_timestamp" % 86400)'), 'at'],
					[fn('sum', literal('"tr_count"::REAL')), 'sum_trc'],
				],
				group: ['at'],
				order: [[literal('"at"'), 'ASC']],
				where: {
					actual_timestamp: {
						[Op.gt]: +offsetDateStartOfDay / 1000,
					},
				},
				raw: true,
			});
			res.send(result);
		} else {
			res.status(400).json({ error: 'Invalid chart type' });
		}
	});

	app.get(
		'/api/get_tx_details/:tx_hash',
		exceptionHandler(async (req, res) => {
			try {
				const tx_hash = req.params.tx_hash.toLowerCase();

				if (tx_hash) {
					// Fetching transaction details with associated block information using Sequelize
					const transaction = await Transaction.findOne({
						where: {
							tx_id: tx_hash,
							keeper_block: { [Op.ne]: null },
						},
					});

					const transactionBlock = await Block.findOne({
						where: { height: transaction?.keeper_block },
					}).catch(() => null);

					if (transaction && transactionBlock) {
						const response = {
							...transaction.toJSON(),
							block_hash: transactionBlock?.tx_id,
							block_timestamp: transactionBlock?.timestamp,
							last_block: lastBlock.height,
						};

						res.json(response);
					} else {
						const response = await get_tx_details(tx_hash);

						const { data } = response;

						if (data?.result?.tx_info) {
							if (
								data.result.tx_info.ins &&
								typeof data.result.tx_info.ins === 'object'
							) {
								data.result.tx_info.ins = JSON.stringify(data.result.tx_info.ins);
							}

							if (
								data.result.tx_info.outs &&
								typeof data.result.tx_info.outs === 'object'
							) {
								data.result.tx_info.outs = JSON.stringify(data.result.tx_info.outs);
							}

							const blockInfo = await Block.findOne({
								where: { height: data.result?.tx_info?.keeper_block?.toString() },
							});

							res.json({
								...data.result.tx_info,
								...(blockInfo?.toJSON() || {}),
								last_block: lastBlock.height,
							});
						} else {
							res.status(500).json({
								message: `/get_tx_details/:tx_hash ${JSON.stringify(req.params)}`,
							});
						}
					}
				} else {
					res.status(500).json({
						message: `/get_tx_details/:tx_hash ${JSON.stringify(req.params)}`,
					});
				}
			} catch (error) {
				console.log(error);

				res.status(500).json({ error: (error as { message: string }).message });
			}
		}),
	);

	app.get(
		'/api/get_tx_by_keyimage/:id',
		exceptionHandler(async (req, res, next) => {
			const id = req.params.id.toLowerCase();

			try {
				// Find transactions where 'ins' column contains the keyimage
				const transactions = await Transaction.findAll({
					where: {
						ins: {
							[Op.like]: `%"kimage_or_ms_id":"${id}"%`,
						},
					},
				});

				// Iterate through each transaction to find the exact match within the 'ins' field
				for (const tx of transactions) {
					try {
						const ins = JSON.parse(String(tx.ins));
						if (Array.isArray(ins) && ins.find((e) => e.kimage_or_ms_id === id)) {
							return res.json({ result: 'FOUND', data: tx.id });
						}
					} catch (error) {
						console.log(error);
					}
				}

				return res.json({ result: 'NOT FOUND' });
			} catch (error) {
				next(error);
			}
		}),
	);

	app.get(
		'/api/search_by_id/:id',
		exceptionHandler(async (req, res, next) => {
			const id = req.params.id.toLowerCase();

			if (!id) {
				return res.json({ result: 'NOT FOUND' });
			}

			try {
				// Search in the 'blocks' table
				const blockResult = await Block.findOne({ where: { tx_id: id } });
				if (blockResult) {
					return res.json({ result: 'block' });
				}

				// Search in the 'alt_blocks' table
				const altBlockResult = await AltBlock.findOne({ where: { hash: id } });
				if (altBlockResult) {
					return res.json({ result: 'alt_block' });
				}

				// Search in the 'transactions' table
				const transactionResult = await Transaction.findOne({ where: { tx_id: id } });
				if (transactionResult) {
					return res.json({ result: 'tx' });
				}

				// Attempt to get transaction details from an external service
				try {
					const response = await get_tx_details(id);
					if (response.data.result) {
						return res.json({ result: 'tx' });
					}
				} catch (error) {
					// Ignore the error and continue searching in the database
				}

				// Search in the 'aliases' table
				const aliasResult = await Alias.findOne({
					where: {
						enabled: true,
						[Op.or]: [
							{ alias: { [Op.like]: `%${id}%` } },
							{ address: { [Op.like]: `%${id}%` } },
							{ comment: { [Op.like]: `%${id}%` } },
						],
					},
					order: [['block', 'DESC']],
				});

				if (aliasResult) {
					return res.json({ result: 'alias' });
				}

				// If nothing is found
				return res.json({ result: 'NOT FOUND' });
			} catch (error) {
				console.log(error);

				next(error);
			}
		}),
	);

	app.get(
		'/api/get_out_info/:amount/:i',
		exceptionHandler(async (req, res) => {
			const { amount, i } = req.params;
			const index = parseInt(i, 10);

			if (amount && !Number.isNaN(index)) {
				const outInfo = await OutInfo.findOne({
					where: {
						amount,
						i: index,
					},
				});

				if (!outInfo) {
					const response = await get_out_info(amount, index);
					res.json({ tx_id: response.data.result.tx_id });
				} else {
					res.json(outInfo.toJSON());
				}
			} else {
				res.status(500).json({
					message: `/get_out_info/:amount/:i ${req.params}`,
				});
			}
		}),
	);

	app.get(
		'/api/get_info',
		exceptionHandler((_, res) => {
			blockInfo.lastBlock = lastBlock.height;
			res.json(blockInfo);
		}),
	);

	app.get(
		'/api/get_blocks_details/:start/:count',
		exceptionHandler(async (req, res) => {
			try {
				const start = parseInt(req.params.start, 10);
				const count = parseInt(req.params.count, 10);

				if (!Number.isNaN(start) && start >= 0 && count) {
					const result = await getBlocksDetails({ start, count });
					res.json(result);
				} else {
					res.status(400).json({ error: 'Invalid parameters' });
				}
			} catch (error) {
				console.log(error);

				res.status(500).json({ error: (error as { message: string }).message });
			}
		}),
	);

	app.get(
		'/api/get_asset_details/:asset_id',
		exceptionHandler(async (req, res) => {
			const { asset_id } = req.params;

			// Check if the asset exists in the database using Sequelize
			const dbAsset = await Asset.findOne({ where: { asset_id } });

			if (!dbAsset) {
				try {
					// Fetch the assets whitelist from the external API
					const response = await axios.get(
						config.assets_whitelist_url ||
							'https://api.zano.org/assets_whitelist_testnet.json',
					);

					if (!response.data.assets) {
						throw new Error('Assets whitelist response not correct');
					}

					const allAssets: WhitelistedAsset[] = response.data.assets;

					// Add Zano (Native) asset as the first item in the list
					allAssets.unshift({
						asset_id: ZANO_ASSET_ID,
						logo: '',
						price_url: '',
						ticker: 'ZANO',
						full_name: 'Zano (Native)',
						total_max_supply: '0',
						current_supply: '0',
						decimal_point: 0,
						meta_info: '',
						price: 0,
					});

					// Find the asset in the whitelist
					const whitelistedAsset = allAssets.find((e) => e.asset_id === asset_id);

					if (whitelistedAsset) {
						return res.json({ success: true, asset: whitelistedAsset });
					}
					return res.json({ success: false, data: 'Asset not found' });
				} catch (error) {
					return res
						.status(500)
						.json({ success: false, error: (error as { message: string }).message });
				}
			} else {
				// If asset is found in the database, return it
				return res.json({ success: true, asset: dbAsset });
			}
		}),
	);

	app.get(
		'/api/get_visibility_info',
		exceptionHandler(async (_, res) => {
			const result = await getVisibilityInfo();
			res.send(result);
		}),
	);

	app.get(
		'/api/get_tx_pool_details/:count',
		exceptionHandler(async (req, res, _next) => {
			const count = parseInt(req.params.count, 10);

			if (count !== undefined) {
				res.json(await getTxPoolDetails(count));
			} else {
				res.status(400).json({ error: 'Invalid parameters' });
			}
		}),
	);

	app.get(
		'/api/get_alt_blocks_details/:offset/:count',
		exceptionHandler(async (req, _res, next) => {
			const offset = parseInt(req.params.offset);
			let count = parseInt(req.params.count);

			if (count > config.maxDaemonRequestCount) {
				count = config.maxDaemonRequestCount;
			}
			const result = await AltBlock.findAll({
				order: [['height', 'DESC']],
				limit: count,
				offset,
			});

			return result.length > 0 ? result.map((e) => e.toJSON()) : [];
		}),
	);

	app.get(
		'/api/get_alt_block_details/:id',
		exceptionHandler(async (req, res, _next) => {
			const id = req.params.id.toLowerCase();

			if (id) {
				const altBlock = await AltBlock.findOne({
					where: {
						hash: id,
					},
				});

				if (altBlock) {
					res.json(altBlock.toJSON());
				} else {
					res.json([]);
				}
			} else {
				res.status(500).json({
					message: `/get_out_info/:amount/:i ${req.params}`,
				});
			}
		}),
	);

	app.get(
		'/api/get_alt_blocks_details/:offset/:count',
		exceptionHandler(async (req, res) => {
			const { offset } = req.params;
			const { count } = req.params;
			const response = await axios({
				method: 'get',
				url: config.api,
				data: {
					method: 'get_alt_blocks_details',
					params: {
						offset: parseInt(offset),
						count: parseInt(count),
					},
				},
			});
			res.json(response.data);
		}),
	);

	app.get(
		'/api/get_alt_block_details/:id',
		exceptionHandler(async (req, res) => {
			const { id } = req.params;
			const response = await axios({
				method: 'get',
				url: config.api,
				data: {
					method: 'get_alt_block_details',
					params: {
						id,
					},
				},
			});
			res.json(response.data);
		}),
	);

	app.get(
		'/api/get_all_pool_tx_list',
		exceptionHandler(async (req, res) => {
			const response = await axios({
				method: 'get',
				url: config.api,
				data: {
					method: 'get_all_pool_tx_list',
				},
			});
			res.json(response.data);
		}),
	);

	app.get(
		'/api/get_pool_txs_details',
		exceptionHandler(async (req, res) => {
			const response = await axios({
				method: 'get',
				url: config.api,
				data: {
					method: 'get_pool_txs_details',
				},
			});
			res.json(response.data);
		}),
	);

	app.get(
		'/api/get_pool_txs_brief_details',
		exceptionHandler(async (req, res) => {
			const response = await axios({
				method: 'get',
				url: config.api,
				data: {
					method: 'get_pool_txs_brief_details',
				},
			});
			res.json(response.data);
		}),
	);

	app.get(
		'/api/price',
		exceptionHandler(async (req, res) => {
			function calcFiatPrice(
				pricePerAssetUSD: number | undefined,
				ratesPerUSD: {
					[key: string]: number | undefined;
				},
			) {
				const fiatPrices: { [key: string]: number } = {};

				const entries = Object.entries(ratesPerUSD);

				for (const entry of entries) {
					const [fiatName, pricePerUsd] = entry;

					fiatPrices[fiatName] = (pricePerAssetUSD || 0) * (pricePerUsd || 0);
				}

				const entitiesToExclude = [
					'lastUpdated',
					'btc',
					'eth',
					'ltc',
					'bch',
					'bnb',
					'eos',
					'xrp',
					'xlm',
					'link',
					'dot',
					'yfi',
				];

				for (const entity of entitiesToExclude) {
					delete fiatPrices[entity];
				}

				return fiatPrices;
			}

			interface ResponsePriceData {
				name: string;
				usd: number | undefined;
				usd_24h_change: number | undefined;
				fiat_prices: {
					[key: string]: number;
				};
			}

			interface ResponseData {
				success: boolean;
				data: {
					[key: string]: ResponsePriceData;
				};
			}

			if (req.query.asset_id) {
				if (req.query.asset_id === ZANO_ASSET_ID) {
					if (!state.priceData?.zano?.price) {
						return res.send({ success: false, data: 'Price not found' });
					}

					return res.send({
						success: true,
						data: {
							name: 'Zano',
							usd: state.priceData?.zano?.price,
							usd_24h_change: state.priceData?.zano?.usd_24h_change,
							fiat_prices: calcFiatPrice(
								state.priceData?.zano?.price,
								state?.fiat_rates,
							),
						},
					});
				}

				const assetData = await Asset.findOne({
					where: { asset_id: req.query.asset_id },
				});

				if (!assetData) {
					return res.json({ success: false, data: 'Asset not found' });
				}

				const assetsPricesResponse = await axios({
					method: 'post',
					url: `${config.trade_api_url}/dex/get-assets-price-rates`,
					data: { assetsIds: [assetData.asset_id] },
				});

				const usdPrice =
					(assetsPricesResponse?.data?.priceRates?.[0]?.rate || 0) *
					(state.priceData?.zano?.price || 0);

				return res.json({
					success: true,
					data: {
						name: assetData.full_name,
						usd: usdPrice,
						usd_24h_change: null,
						fiat_prices: calcFiatPrice(usdPrice, state?.fiat_rates),
					},
				});

				// Assuming that you handle further processing of the `assetData` here...
			}

			const responseData: ResponseData = {
				success: true,
				data: {
					zano: {
						name: 'Zano',
						usd: state.priceData?.zano?.price,
						usd_24h_change: state.priceData?.zano?.usd_24h_change,
						fiat_prices: calcFiatPrice(state.priceData?.zano?.price, state?.fiat_rates),
					},
				},
			};

			switch (req.query.asset) {
				case 'ethereum':
					if (state.priceData?.ethereum?.price === undefined) {
						responseData.data = {};
						responseData.success = false;
					} else {
						responseData.data = {
							ethereum: {
								usd: state.priceData?.ethereum?.price,
								usd_24h_change: state.priceData?.ethereum?.usd_24h_change,
								name: 'Ethereum',
								fiat_prices: calcFiatPrice(
									state.priceData?.ethereum?.price,
									state?.fiat_rates,
								),
							},
						};
					}
					break;
				default:
					if (state.priceData?.zano?.price === undefined) {
						responseData.data = {};
						responseData.success = false;
					}
					break;
			}

			return res.json(responseData);
		}),
	);

	app.get(
		'/api/get_asset_details/:asset_id',
		exceptionHandler(async (req, res) => {
			const { asset_id } = req.params;

			const dbAsset = await Asset.findOne({
				where: { asset_id },
			});

			if (!dbAsset) {
				// Fetch the external asset list
				const response = await axios({
					method: 'get',
					url:
						config.assets_whitelist_url ||
						'https://api.zano.org/assets_whitelist_testnet.json',
				});

				if (!response.data.assets) {
					throw new Error('Assets whitelist response not correct');
				}

				// Add Zano to the beginning of the list
				const allAssets: WhitelistedAsset[] = response.data.assets;
				allAssets.unshift({
					asset_id: ZANO_ASSET_ID,
					logo: '',
					price_url: '',
					ticker: 'ZANO',
					full_name: 'Zano (Native)',
					total_max_supply: '0',
					current_supply: '0',
					decimal_point: 0,
					meta_info: '',
					price: 0,
				});

				const whitelistedAsset = allAssets.find((e) => e.asset_id === asset_id);

				if (whitelistedAsset) {
					return res.json({ success: true, asset: whitelistedAsset });
				}
				return res.json({ success: false, data: 'Asset not found' });
			}
			return res.json({ success: true, asset: dbAsset });
		}),
	);

	app.post(
		'/api/get_assets_price_rates',
		exceptionHandler(async (req, res) => {
			const { assetsIds } = req.body;
			if (!assetsIds) {
				return res.json({ success: false, data: 'Asset id not provided' });
			}
			const assetsPricesResponse = await axios({
				method: 'post',
				url: `${config.trade_api_url}/dex/get-assets-price-rates`,
				data: { assetsIds },
			});

			const assetsPrices = assetsPricesResponse.data;

			if (assetsPricesResponse?.data?.success) {
				return res.json({ success: true, priceRates: assetsPrices.priceRates });
			}
			return res.json({ success: false, data: 'Assets not found' });
		}),
	);

	app.get(
		'/api/explorer_status',
		exceptionHandler(async (req, res) => {
			res.json({
				success: true,
				data: {
					explorer_status: state.explorer_status,
				},
			});
		}),
	);

	app.get(
		'/api/get_matrix_addresses',
		exceptionHandler(async (req, res) => {
			const { page, items } = req.query;

			if (!page || !items) {
				return res.status(200).send({
					success: false,
					data: 'no page or items provided',
				});
			}

			const matrixAddressesResponse = await fetch(
				`${config.matrix_api_url}/get-registered-addresses/?page=${page}&items=${items}`,
			).then((res) => res.json());

			const { addresses } = matrixAddressesResponse;

			if (matrixAddressesResponse?.success && addresses) {
				return res.status(200).send({
					success: true,
					addresses,
				});
			}
			return res.status(200).send({
				success: false,
			});
		}),
	);

	io.on('connection', (socket) => {
		console.log('new socket connected');

		const onSocketInfo = () => emitSocketInfo(socket);
		const onSocketPool = async () => {
			io.emit('get_transaction_pool_info', JSON.stringify(await getTxPoolDetails(0)));
		};

		socket.on('get-socket-info', onSocketInfo);
		socket.on('get-socket-pool', onSocketPool);

		socket.on('disconnect', () => {
			console.log('Socket disconnected');
			socket.off('get-socket-info', onSocketInfo);
			socket.off('get-socket-pool', onSocketPool);
		});
	});

	app.all('*', (req, res) => {
		return handle(req, res);
	});
	// config.server_port
	server.listen(config.server_port, () => {
		const address = server.address();
		const port =
			typeof address === 'object' && address !== null ? address.port : config.server_port;
		log(`Server listening on port ${port}`);
	});

	// App logic

	const syncTransactions = async () => {
		if (state.block_array.length > 0) {
			const blockInserts: IBlock[] = [];
			const transactionInserts: ITransaction[] = [];
			const chartInserts: IChart[] = [];
			const outInfoInserts: IOutInfo[] = [];

			for (const bl of state.block_array) {
				try {
					if (bl.tr_count === undefined) bl.tr_count = bl.transactions_details.length;
					if (bl.tr_out === undefined) bl.tr_out = [];

					while (bl.transactions_details.length > 0) {
						const [localTr] = bl.transactions_details.splice(0, 1);
						const response = await get_tx_details(localTr.id);

						const { tx_info } = response.data.result;

						for (const item of tx_info.extra) {
							if (item.type === 'alias_info') {
								const arr = item.short_view.split('-->');
								const aliasName = arr[0];
								const aliasAddress = arr[1];
								const aliasComment = parseComment(
									item.datails_view || item.details_view,
								);
								const aliasTrackingKey = parseTrackingKey(
									item.datails_view || item.details_view,
								);
								const aliasBlock = bl.height;
								const aliasTransaction = localTr.id;

								await Alias.update({ enabled: 0 }, { where: { alias: aliasName } });

								try {
									await Alias.upsert({
										alias: decodeString(aliasName),
										address: aliasAddress,
										comment: decodeString(aliasComment),
										tracking_key: decodeString(aliasTrackingKey),
										block: aliasBlock,
										transact: aliasTransaction,
										enabled: 1,
									});
								} catch (error) {
									log(`SyncTransactions() Insert into aliases ERROR: ${error}`);
								}
							}
						}

						for (const item of tx_info.ins) {
							if (item.global_indexes) {
								bl.tr_out.push({
									amount: item.amount,
									i: item.global_indexes[0],
								});
							}
						}

						transactionInserts.push({
							keeper_block: tx_info.keeper_block,
							tx_id: tx_info.id,
							amount: tx_info.amount.toString(),
							blob_size: tx_info.blob_size,
							extra: decodeString(JSON.stringify(tx_info.extra)),
							fee: tx_info.fee,
							ins: decodeString(JSON.stringify(tx_info.ins)),
							outs: decodeString(JSON.stringify(tx_info.outs)),
							pub_key: tx_info.pub_key,
							timestamp: tx_info.timestamp,
							attachments: decodeString(
								JSON.stringify(tx_info.attachments ? tx_info.attachments : {}),
							),
						});
					}
				} catch (error) {
					log(`SyncTransactions() Inserting aliases ERROR: ${error}`);
				}

				chartInserts.push({
					height: bl.height,
					actual_timestamp: bl.actual_timestamp,
					block_cumulative_size: bl.block_cumulative_size,
					cumulative_diff_precise: bl.cumulative_diff_precise,
					difficulty: bl.difficulty,
					tr_count: bl.tr_count ? bl.tr_count : 0,
					type: bl.type,
				});

				if (bl.tr_out && bl.tr_out.length > 0) {
					for (const localOut of bl.tr_out) {
						const localOutAmount = new BigNumber(localOut.amount).toNumber();
						const response = await get_out_info(String(localOutAmount), localOut.i);

						outInfoInserts.push({
							amount: localOut.amount?.toString(),
							i: localOut.i,
							tx_id: response.data.result.tx_id,
							block: bl.height,
						});
					}

					await sequelize.transaction(async (transaction) => {
						try {
							if (outInfoInserts.length > 0) {
								await OutInfo.bulkCreate(outInfoInserts, {
									ignoreDuplicates: true,
									transaction,
								});
							}
						} catch (error) {
							log(`SyncTransactions() Insert Into out_info ERROR: ${error}`);
						}
					});
				}

				blockInserts.push({
					height: bl.height,
					actual_timestamp: bl.actual_timestamp,
					base_reward: bl.base_reward,
					blob: bl.blob,
					block_cumulative_size: bl.block_cumulative_size,
					block_tself_size: bl.block_tself_size,
					cumulative_diff_adjusted: bl.cumulative_diff_adjusted,
					cumulative_diff_precise: bl.cumulative_diff_precise,
					difficulty: bl.difficulty,
					effective_fee_median: bl.effective_fee_median,
					tx_id: bl.id,
					is_orphan: bl.is_orphan,
					penalty: bl.penalty,
					prev_id: bl.prev_id,
					summary_reward: bl.summary_reward,
					this_block_fee_median: bl.this_block_fee_median,
					timestamp: bl.timestamp,
					total_fee: bl.total_fee,
					total_txs_size: bl.total_txs_size,
					tr_count: bl.tr_count ? bl.tr_count : 0,
					type: bl.type,
					miner_text_info: decodeString(bl.miner_text_info),
					already_generated_coins: bl.already_generated_coins,
					object_in_json: decodeString(bl.object_in_json),
					pow_seed: bl.pow_seed,
				});
			}

			await sequelize.transaction(async (transaction) => {
				try {
					if (blockInserts.length > 0) {
						await Block.bulkCreate(blockInserts, {
							transaction,
							ignoreDuplicates: true,
						});
					}

					if (transactionInserts.length > 0) {
						await Transaction.bulkCreate(transactionInserts, {
							ignoreDuplicates: true,
							transaction,
						});
					}

					if (chartInserts.length > 0) {
						await Chart.bulkCreate(chartInserts, {
							transaction,
							ignoreDuplicates: true,
						});
					}

					// const elementOne = state.block_array[0];
					const newLastBlock = state.block_array.pop();
					setLastBlock({
						height: newLastBlock?.height || 0,
						tx_id: newLastBlock?.id,
					});
					log(`BLOCKS: db = ${lastBlock.height}/ server = ${blockInfo.height}`);

					// await sequelize.query(
					//     `CALL update_statistics(${Math.min(elementOne.height, lastBlock.height)})`,
					//     { transaction }
					// );

					setState({
						...state,
						block_array: [],
					});
				} catch (error) {
					console.log(error);

					log(`SyncTransactions() Transaction Commit ERROR: ${error}`);
					throw error;
				}
			});
		}
	};

	const syncBlocks = async () => {
		console.log('Sync block called');

		try {
			// await syncPrevBlocksTnxKeepers(lastBlock.height);

			let count = (blockInfo?.height || 0) - lastBlock.height + 1;
			if (count > 100) {
				setState({
					...state,
					explorer_status: 'syncing',
				});
				count = 100;
			}
			if (count < 0) {
				count = 1;
			}

			// Get block details from the external service
			const response = await get_blocks_details(lastBlock.height + 1, count);
			const localBlocks =
				response.data.result && response.data.result.blocks
					? response.data.result.blocks
					: [];

			if (localBlocks.length && lastBlock.tx_id === localBlocks[0].prev_id) {
				state.block_array = localBlocks;
				await syncTransactions();

				if (lastBlock.height >= (blockInfo?.height || 0) - 1) {
					state.now_blocks_sync = false;
					// config.websocket.enabled_during_sync = true;
					await emitSocketInfo();
				} else {
					await pause(state.serverTimeout);
					await syncBlocks();
				}
			} else {
				const deleteHeightThreshold = lastBlock.height - 100;

				// Delete blocks with height greater than the threshold
				await Block.destroy({
					where: {
						height: {
							[Op.gt]: deleteHeightThreshold,
						},
					},
				});

				// Find the block with the maximum height after deletion
				const result = await Block.findOne({
					order: [['height', 'DESC']],
				});

				if (result) {
					setLastBlock(result.dataValues);
				} else {
					setLastBlock({
						height: -1,
						tx_id: '0000000000000000000000000000000000000000000000000000000000000000',
					});
				}

				await pause(state.serverTimeout);
				await syncBlocks();
			}
		} catch (error) {
			log(`SyncBlocks() get_blocks_details ERROR: ${(error as { message: string }).message}`);
			state.now_blocks_sync = false;
		}
	};

	// const syncPrevBlocksTnxKeepers = async (syncedHeight: number) => {
	// 	async function syncTnxKeepers(blocks: any[]) {
	// 		for (const block of blocks) {
	// 			const txs = block.transactions_details;

	// 			for (const tx of txs) {
	// 				const response = await get_tx_details(tx.id);
	// 				const { tx_info } = response.data.result;

	// 				await Transaction.update(
	// 					{
	// 						keeper_block: tx_info.keeper_block,
	// 					},
	// 					{
	// 						where: {
	// 							tx_id: tx_info.id,
	// 						},
	// 					},
	// 				);
	// 			}
	// 		}
	// 	}

	// 	const count = 10;
	// 	const response = await get_blocks_details(syncedHeight - count, count);

	// 	const localBlocks = response.data?.result?.blocks || [];

	// 	if (localBlocks.length) {
	// 		await syncTnxKeepers(localBlocks);
	// 	}
	// };

	const syncAltBlocks = async () => {
		try {
			setState({
				...state,
				statusSyncAltBlocks: true,
			});

			// Start a transaction
			const transaction = await sequelize.transaction();

			try {
				// Delete all records from the alt_blocks table within the transaction
				await AltBlock.destroy({ where: {}, transaction });

				// Fetch the alt block details from the external service
				const response = await get_alt_blocks_details(0, state.countAltBlocksServer);

				// Iterate through the blocks and insert them into the alt_blocks table
				for (const block of response.data.result.blocks) {
					await AltBlock.create(
						{
							height: block.height,
							timestamp: block.timestamp,
							actual_timestamp: block.actual_timestamp,
							size: block.block_cumulative_size,
							hash: block.id,
							type: block.type,
							difficulty: block.difficulty,
							cumulative_diff_adjusted: block.cumulative_diff_adjusted,
							cumulative_diff_precise: block.cumulative_diff_precise,
							is_orphan: block.is_orphan,
							base_reward: block.base_reward,
							total_fee: block.total_fee,
							penalty: block.penalty,
							summary_reward: block.summary_reward,
							block_cumulative_size: block.block_cumulative_size,
							this_block_fee_median: block.this_block_fee_median,
							effective_fee_median: block.effective_fee_median,
							total_txs_size: block.total_txs_size,
							transactions_details: JSON.stringify(block.transactions_details),
							miner_txt_info: block.miner_text_info
								.replace('\u0000', '')
								.replace("'", "''"),
							pow_seed: '', // Adjust as needed
						},
						{ transaction },
					);
				}

				// Commit the transaction
				await transaction.commit();

				// Get the updated count of alt blocks in the database
				setState({
					...state,
					countAltBlocksDB: await AltBlock.count(),
				});
			} catch (error) {
				// Rollback the transaction in case of an error
				await transaction.rollback();
				throw error;
			}
		} catch (error) {
			log(`SyncAltBlocks() ERROR: ${(error as { message: string }).message}`);
		} finally {
			setState({
				...state,
				statusSyncAltBlocks: false,
			});
		}
	};

	const syncPool = async () => {
		try {
			// statusSyncPool = true;
			// countTrPoolServer = blockInfo.tx_pool_size;

			setState({
				...state,
				statusSyncPool: true,
				countTrPoolServer: blockInfo.tx_pool_size,
			});

			if (state.countTrPoolServer === 0) {
				// Clear the pool if there are no transactions on the server
				await Pool.destroy({ where: {} });
				setState({
					...state,
					statusSyncPool: false,
				});
				io.emit('get_transaction_pool_info', JSON.stringify([]));
			} else {
				const response = await get_all_pool_tx_list();

				if (response.data.result.ids) {
					setState({
						...state,
						pools_array: response?.data?.result?.ids || [],
					});

					try {
						// Delete pool entries not in the current pool list from the server
						await Pool.destroy({
							where: {
								tx_id: {
									[Op.notIn]: state.pools_array,
								},
							},
						});
					} catch (error) {
						log(`Delete From Pool ERROR: ${(error as { message: string }).message}`);
					}

					try {
						// Fetch all transaction ids currently in the pool
						const existingTransactions = await Pool.findAll({
							attributes: ['id'],
						});

						// Find new transactions that are not already in the pool
						const existingIds = existingTransactions.map((tx) => tx.tx_id);
						const new_ids = state.pools_array.filter(
							(id) => !existingIds.includes(id as unknown as string),
						);

						if (new_ids.length) {
							try {
								// Fetch details of the new transactions
								const response = await get_pool_txs_details(new_ids);
								if (response.data.result && response.data.result.txs) {
									const existingTransactions = await Pool.findAll({
										attributes: ['tx_id'],
									});

									const { txs } = response.data.result;

									const txInserts = (txs as TransactionDataType[])
										.map((tx) => ({
											blob_size: tx.blob_size,
											fee: tx.fee,
											tx_id: tx.id,
											timestamp: tx.timestamp * 1e3,
										}))
										.filter(
											(tx) =>
												!existingTransactions
													.map((e) => e.tx_id)
													.includes(tx.tx_id),
										);

									// Insert the new transactions into the pool
									if (txInserts.length > 0) {
										await sequelize.transaction(async (transaction) => {
											await Pool.bulkCreate(txInserts, {
												transaction,
												ignoreDuplicates: true,
											});
										});
									}
								}
								io.emit(
									'get_transaction_pool_info',
									JSON.stringify(await getTxPoolDetails(0)),
								);
							} catch (error) {
								log(
									`Error fetching new pool transactions: ${(error as { message: string }).message}`,
								);
							}
						}

						setState({
							...state,
							statusSyncPool: false,
						});
					} catch (error) {
						log(`Select id from pool ERROR: ${(error as { message: string }).message}`);
					}
				} else {
					setState({
						...state,
						statusSyncPool: false,
					});
				}
			}
		} catch (error) {
			log(`SyncPool() ERROR: ${(error as { message: string }).message}`);
			await Pool.destroy({ where: {} });

			setState({
				...state,
				statusSyncPool: false,
			});
		}
	};

	const getInfoTimer = async (): Promise<void> => {
		console.log('Called git info timer');

		// chech explorer status

		const infoResponse = await get_info()
			.then((r) => r.data)
			.catch((_) => null);

		if (!infoResponse || !infoResponse?.result?.height) {
			setState({
				...state,
				explorer_status: 'offline',
			});
		} else {
			setState({
				...state,
				explorer_status: 'online',
			});
		}

		if (!state.now_delete_offers) {
			try {
				const response = await get_info();

				const databaseHeight = (await Block.max('height')) || 0;

				console.log('databaseHeight', databaseHeight);
				console.log('blockchain height', response.data?.result?.height);

				setBlockInfo({
					...response.data.result,
					database_height: databaseHeight,
				});

				const txs = await Transaction.findAll({
					where: {
						keeper_block: {
							[Op.gte]: 2555000,
						},
						fee: {
							[Op.ne]: '0',
						},
					},
					attributes: ['fee'],
					raw: true,
				});

				let zanoBurnedBig = new BigNumber(0);

				txs.forEach((tx) => {
					zanoBurnedBig = zanoBurnedBig.plus(new BigNumber(tx.fee));
				});

				console.log('ZANO BURNED: ', zanoBurnedBig.toString());

				const zanoBurned = zanoBurnedBig.div(new BigNumber(10).pow(12)).toNumber();

				setState({
					...state,
					countAliasesServer: response.data.result.alias_count,
					countAltBlocksServer: response.data.result.alt_blocks_count,
					countTrPoolServer: response.data.result.tx_pool_size,
					zanoBurned,
				});

				if (!state.statusSyncPool) {
					// Fetch the count of transactions in the pool using Sequelize
					const poolTransactionCount = await Pool.count();

					if (poolTransactionCount !== state.countTrPoolServer) {
						log(
							`need to update pool transactions, db=${poolTransactionCount} server=${state.countTrPoolServer}`,
						);
						await syncPool();
					}
				}

				if (!state.statusSyncAltBlocks) {
					if (state.countAltBlocksServer !== state.countAltBlocksDB) {
						log(
							`need to update alt-blocks, db=${state.countAltBlocksDB} server=${state.countAltBlocksServer}`,
						);
						await syncAltBlocks();
					}
				}

				if (lastBlock.height !== (blockInfo.height || 0) - 1 && !state.now_blocks_sync) {
					log(`need to update blocks, db=${lastBlock.height} server=${blockInfo.height}`);

					// Fetch the count of aliases using Sequelize
					const aliasCountDB = await Alias.count();

					if (aliasCountDB !== state.countAliasesServer) {
						log(
							`need to update aliases, db=${aliasCountDB} server=${state.countAliasesServer}`,
						);
					}

					setState({
						...state,
						now_blocks_sync: true,
					});
					await syncBlocks();
					await emitSocketInfo();
				}

				// Pause for 10 seconds
				await pause(10000);
				return getInfoTimer();
			} catch (error) {
				log(`getInfoTimer() ERROR: ${(error as { message: string }).message}`);
				blockInfo.daemon_network_state = 0;
				// Pause for 5 minutes on error
				await pause(300000);
				return getInfoTimer();
			}
		} else {
			// If now_delete_offers is true, pause for 10 seconds before retrying
			await pause(10000);
			return getInfoTimer();
		}
	};

	const start = async () => {
		try {
			// Delete all records from the alt_blocks table
			await AltBlock.destroy({
				where: {},
				truncate: true,
			});

			// Get the block with the maximum height
			const lastBlockResult = await Block.findOne({
				order: [['height', 'DESC']],
			});

			if (lastBlockResult) {
				setLastBlock({
					height: lastBlockResult.height,
					tx_id: lastBlockResult.tx_id,
				});
			}

			// Get the count of aliases
			const aliasCountResult = await Alias.count();
			setState({
				...state,
				countAliasesDB: aliasCountResult,
			});

			// Get the count of alt_blocks
			const altBlockCountResult = await AltBlock.count();
			setState({
				...state,
				countAltBlocksDB: altBlockCountResult,
			});

			// Call the getInfoTimer function
			getInfoTimer();
		} catch (error) {
			log(`Start ERROR: ${(error as { message: string }).message}`);
		}
	};

	start();
})();

(async () => {
	await waitForDb();

	if (process.env.RESYNC_ASSETS === 'true') {
		console.log('Resyncing assets');

		await Asset.destroy({ where: {} });
	}

	async function fetchPriceFromMexc(symbol: string): Promise<PriceData | null> {
		try {
			const [avgPriceResponse, tickerResponse] = await Promise.all([
				axios({
					method: 'get',
					url: `${config.mexc_api_url}/api/v3/avgPrice?symbol=${symbol}USDT`,
				}),
				axios({
					method: 'get',
					url: `${config.mexc_api_url}/api/v3/ticker/24hr?symbol=${symbol}USDT`,
				}),
			]);
			const result: PriceData = {
				lastUpdated: new Date().toISOString(),
			};
			if (avgPriceResponse.data?.price) {
				result.price = parseFloat(avgPriceResponse.data.price);
			}
			if (tickerResponse.data?.priceChange) {
				result.usd_24h_change = parseFloat(tickerResponse.data.priceChange);
			}
			return result;
		} catch (error) {
			console.error(`Error fetching ${symbol} price from MEXC:`, error);
			return null;
		}
	}

	// Fetch Zano price from MEXC
	async function fetchZanoPrice() {
		return fetchPriceFromMexc('ZANO');
	}

	// Fetch Ethereum price from MEXC
	async function fetchEthereumPrice() {
		return fetchPriceFromMexc('ETH');
	}

	// Fetch fiat rates from CoinGecko
	async function fetchFiatRates() {
		try {
			const { data: supportedCurrencies } = await axios({
				method: 'get',
				url: `https://api.coingecko.com/api/v3/simple/supported_vs_currencies`,
			});

			// Validate the response is an array
			if (!Array.isArray(supportedCurrencies)) {
				console.error(
					'CoinGecko supported currencies response is not an array:',
					supportedCurrencies,
				);
				return null;
			}

			const { data: ratesData } = await axios({
				method: 'get',
				url: `https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=${supportedCurrencies.join(
					',',
				)}`,
			});

			if (ratesData?.usd) {
				return {
					...ratesData.usd,
					usd: 1, // USD to USD is always 1
					lastUpdated: new Date().toISOString(),
				};
			}
			return null;
		} catch (error) {
			console.error('Error fetching fiat rates from CoinGecko:', error);
			return null;
		}
	}

	async function fetchAssets(offset: number, count: number) {
		try {
			const response = await axios({
				method: 'get',
				url: config.api,
				data: {
					method: 'get_assets_list',
					params: {
						count,
						offset,
					},
				},
			});

			return response?.data?.result?.assets || [];
		} catch (err) {
			console.log(err);
			return [];
		}
	}

	while (true) {
		try {
			const zanoPrice = await fetchZanoPrice();

			if (zanoPrice) {
				setState({
					...state,
					priceData: {
						...state.priceData,
						zano: zanoPrice,
					},
				});
			}

			// Fetch Ethereum price every 10 seconds
			const ethPrice = await fetchEthereumPrice();

			if (ethPrice) {
				setState({
					...state,
					priceData: {
						...state.priceData,
						ethereum: ethPrice,
					},
				});
			}

			console.log(state.priceData);

			// Fetch fiat rates every 1h (3600 seconds)
			if (
				Date.now() -
					(state?.fiat_rates?.lastUpdated
						? new Date(state.fiat_rates.lastUpdated).getTime()
						: 0) >
				3600 * 1000
			) {
				const fiatRates = await fetchFiatRates();

				if (fiatRates) {
					setState({
						...state,
						fiat_rates: fiatRates,
					});
				}
			}

			// Fetch all assets
			const assets: IAsset[] = [];
			let iterator = 0;
			const amountPerIteration = 100;

			while (true) {
				const newAssets = (await fetchAssets(iterator, amountPerIteration)).filter(
					(e: { ticker: string; full_name: string }) =>
						/^[A-Za-z0-9]{1,14}$/.test(e.ticker) &&
						/^[A-Za-z0-9.,:!?\-() ]{0,400}$/.test(e?.full_name),
				);
				if (!newAssets.length) break;
				assets.push(...newAssets);
				iterator += amountPerIteration;
			}

			console.log('Got assets list', assets.length);

			// Fetch existing assets from the database
			const assetsRows = await Asset.findAll();

			// Update or delete existing assets
			for (const assetRow of assetsRows) {
				const foundAsset = assets.find((e) => e.asset_id === assetRow.asset_id);
				if (!foundAsset) {
					// Delete asset if not found in the external data
					await Asset.destroy({
						where: { asset_id: assetRow.asset_id },
					});
				} else {
					// Update existing asset
					const {
						asset_id,
						logo,
						price_url,
						ticker,
						full_name,
						total_max_supply,
						current_supply,
						decimal_point,
						meta_info,
						price,
					} = foundAsset;

					await Asset.update(
						{
							logo: logo || '',
							price_url: price_url || '',
							ticker: ticker || '',
							full_name: full_name || '',
							total_max_supply: total_max_supply?.toString() || '0',
							current_supply: current_supply?.toString() || '0',
							decimal_point: decimal_point || 0,
							meta_info: meta_info || '',
							price,
						},
						{
							where: { asset_id },
						},
					);
				}
			}

			const addedAssetsIds = new Set<string>();

			// Insert new assets
			for (const asset of assets) {
				const foundAsset = assetsRows.find((e) => e.asset_id === asset.asset_id);

				if (!foundAsset && !addedAssetsIds.has(asset.asset_id) && asset.asset_id) {
					const {
						asset_id,
						logo,
						price_url,
						ticker,
						full_name,
						total_max_supply,
						current_supply,
						decimal_point,
						meta_info,
						price = 0,
					} = asset;

					await Asset.create({
						asset_id,
						logo: logo || '',
						price_url: price_url || '',
						ticker,
						full_name,
						total_max_supply: total_max_supply?.toString(),
						current_supply: current_supply?.toString(),
						decimal_point,
						meta_info: meta_info || '',
						price,
					});

					addedAssetsIds.add(asset_id);
				}
			}
		} catch (error) {
			console.log('ASSETS PARSING ERROR');
			console.log('Error: ', error);
		}

		// Wait for 60 seconds before the next iteration
		await new Promise((res) => setTimeout(res, 10 * 1e3));
	}
})();
