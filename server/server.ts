import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import exceptionHandler from "./exceptionHandler";
import path from "path";
import initDB from "./database/initdb";
import sequelize from "./database/sequelize";
import { log, config } from "./utils/utils";
import { blockInfo, lastBlock } from "./utils/states";
import { emitSocketInfo, getBlocksDetails, getMainBlockDetails, getTxPoolDetails, getVisibilityInfo } from "./utils/methods";
import AltBlock from "./schemes/AltBlock";
import Transaction from "./schemes/Transaction";
import OutInfo from "./schemes/OutInfo";
import Block from "./schemes/Block";
import { get_out_info, get_tx_details } from "./utils/zanod";


const app = express();
const server = http.createServer(app);
export const io = new Server(server, { transports: ['websocket', 'polling'] });

(async () => {
    await initDB();
    await sequelize.authenticate();
    await sequelize.sync();

    io.engine.on('initial_headers', (headers, req) => {
        headers['Access-Control-Allow-Origin'] = config.frontend_api
    })

    io.engine.on('headers', (headers, req) => {
        headers['Access-Control-Allow-Origin'] = config.frontend_api
    })

    app.use(express.static('dist'));
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*')
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        )
        next()
    })

    app.get(
        '/api/get_tx_details/:tx_hash',
        exceptionHandler(async (req, res) => {
            const tx_hash = req.params.tx_hash.toLowerCase();

            if (tx_hash) {
                // Fetching transaction details with associated block information using Sequelize
                const transaction = await Transaction.findOne({
                    where: { id: tx_hash },
                    include: [
                        {
                            model: Block,
                            attributes: ['id', 'timestamp'],
                            required: false,
                        },
                    ],
                });

                
                const transactionBlock = await Block.findOne({
                    where: { tx_id: transaction?.keeper_block },
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
                    const data = response.data;

                    if (data?.result?.tx_info) {
                        if (data.result.tx_info.ins && typeof data.result.tx_info.ins === 'object') {
                            data.result.tx_info.ins = JSON.stringify(data.result.tx_info.ins);
                        }

                        if (data.result.tx_info.outs && typeof data.result.tx_info.outs === 'object') {
                            data.result.tx_info.outs = JSON.stringify(data.result.tx_info.outs);
                        }

                        res.json(data.result.tx_info);
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
        })
    );

    app.get(
        '/api/get_out_info/:amount/:i',
        exceptionHandler(async (req, res) => {
          const { amount, i } = req.params;
          const index = parseInt(i, 10);
      
          if (amount && !isNaN(index)) {
              const outInfo = await OutInfo.findOne({
                where: {
                  amount: amount,
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
        })
      );

    app.get(
        '/api/get_info',
        exceptionHandler((_, res) => {
            blockInfo.lastBlock = lastBlock.height
            res.json(blockInfo);
        })
    );

    app.get(
        '/api/get_blocks_details/:start/:count',
        exceptionHandler(async (req, res) => {
            const start = parseInt(req.params.start, 10);
            const count = parseInt(req.params.count, 10);

            if (start && count) {
                const result = await getBlocksDetails({ start, count });
                res.json(result);
            } else {
                res.status(400).json({ error: 'Invalid parameters' });
            }
        })
    );


    app.get(
        '/api/get_visibility_info',
        exceptionHandler(async (_, res) => {
            const result = await getVisibilityInfo();
            res.send(result)
        })
    );

    app.get(
        '/api/get_main_block_details/:id',
        exceptionHandler(async (req, res) => {
            let id = req.params.id.toLowerCase()
            if (id) {
                const result = await getMainBlockDetails(id);
                res.json(result || "Block not found");
            }

            res.status(400).json({ error: 'Invalid parameters' });
        })
    );

    app.get(
        '/api/get_tx_pool_details/:count',
        exceptionHandler(async (req, res, next) => {
            let count = parseInt(req.params.count, 10);

            if (count !== undefined) {
                res.json(await getTxPoolDetails(count))
            } else {
                res.status(400).json({ error: 'Invalid parameters' });
            }
        })
    );

    app.get(
        '/api/get_alt_blocks_details/:offset/:count',
        exceptionHandler(async (req, res, next) => {
            let offset = parseInt(req.params.offset)
            let count = parseInt(req.params.count)

            if (count > config.maxDaemonRequestCount) {
                count = config.maxDaemonRequestCount
            }
            const result = await AltBlock.findAll({
                order: [['height', 'DESC']],
                limit: count,
                offset: offset
            });

            return result.length > 0 ? result.map(e => e.toJSON()) : [];
        })
    );

    app.get(
        '/api/get_alt_block_details/:id',
        exceptionHandler(async (req, res, next) => {
            const id = req.params.id.toLowerCase();

            if (id) {
                const altBlock = await AltBlock.findOne({
                    where: {
                        hash: id
                    }
                });

                if (altBlock) {
                    res.json(altBlock.toJSON());
                } else {
                    res.json([]);
                }
            } else {
                res.status(500).json({
                    message: `/get_out_info/:amount/:i ${req.params}`
                });
            }
        })
    );

    app.get(
        '/api/get_alt_blocks_details/:offset/:count',
        exceptionHandler(async (req, res) => {
            let offset = req.params.offset
            let count = req.params.count
            const response = await axios({
                method: 'get',
                url: config.api,
                data: {
                    method: 'get_alt_blocks_details',
                    params: {
                        offset: parseInt(offset),
                        count: parseInt(count)
                    }
                }
            })
            res.json(response.data)
        })
    )

    app.get(
        '/api/get_alt_block_details/:id',
        exceptionHandler(async (req, res) => {
            let id = req.params.id
            const response = await axios({
                method: 'get',
                url: config.api,
                data: {
                    method: 'get_alt_block_details',
                    params: {
                        id: id
                    }
                }
            })
            res.json(response.data)
        })
    )

    app.get(
        '/api/get_all_pool_tx_list',
        exceptionHandler(async (req, res) => {
            const response = await axios({
                method: 'get',
                url: config.api,
                data: {
                    method: 'get_all_pool_tx_list'
                }
            })
            res.json(response.data)
        })
    )

    app.get(
        '/api/get_pool_txs_details',
        exceptionHandler(async (req, res) => {
            const response = await axios({
                method: 'get',
                url: config.api,
                data: {
                    method: 'get_pool_txs_details'
                }
            })
            res.json(response.data)
        })
    )

    app.get(
        '/api/get_pool_txs_brief_details',
        exceptionHandler(async (req, res) => {
            const response = await axios({
                method: 'get',
                url: config.api,
                data: {
                    method: 'get_pool_txs_brief_details'
                }
            })
            res.json(response.data)
        })
    )

    app.get(
        '/api/get_tx_details/:tx_hash',
        exceptionHandler(async (req, res) => {
            let tx_hash = req.params.tx_hash
            const response = await axios({
                method: 'get',
                url: config.api,
                data: {
                    method: 'get_tx_details',
                    params: { tx_hash: tx_hash }
                }
            })
            res.json(response.data)
        })
    );

    app.get("/*", function (req, res) {
        const buildPath = path.resolve(__dirname, "../build/index.html");
        res.sendFile(buildPath);
    });

    io.on('connection', async (socket) => {
        socket.on('get-socket-info', () => {
            emitSocketInfo(socket);
        })
        socket.on('get-socket-pool', async () => {
            io.emit('get_transaction_pool_info', JSON.stringify(await getTxPoolDetails(0)))
        });
    })

    server.listen(config.server_port, () => {
        // @ts-ignore
        log(`Server listening on port ${server?.address()?.port}`)
    })


})();