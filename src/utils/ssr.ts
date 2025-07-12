import VisibilityInfo from '@/interfaces/state/VisibilityInfo';
import Block from '@/interfaces/state/Block';
import { PoolElement } from '@/components/default/TransactionPool/TransactionPool';
import Info from '@/interfaces/state/Info';
import { latestBlocksInitState } from '@/components/default/LatestBlocks/LatestBlocks';
import { DEFAULT_ITEMS_ON_PAGE } from '@/pages/aliases';
import { DEFAULT_ASSETS_ON_PAGE } from '@/pages/assets';
import { GetServerSidePropsContext } from 'next';
import { ZANO_ID } from './constants';
import Utils from './utils';
import Fetch from './methods';

export async function getMainPageProps() {
	let visibilityInfo: VisibilityInfo | null = null;
	let info: Info | null = null;
	let latestBlocks: Block[] = [];
	let explorerStatus: 'online' | 'offline' | 'syncing' = 'offline';
	let txPoolElements: PoolElement[] = [];

	try {
		const response = await Fetch.getVisibilityInfo();

		if (response.success === false) {
			visibilityInfo = null;
		} else {
			visibilityInfo = response;
		}
	} catch {
		visibilityInfo = null;
	}

	try {
		const response = await Fetch.getInfo();

		if (response.success === false) {
			info = null;
		} else {
			info = response;
		}
	} catch {
		info = null;
	}

	try {
		const status = await Fetch.getExplorerStatus();

		explorerStatus = status?.data?.explorer_status || 'offline';
	} catch (error) {
		console.error('Error fetching explorer status:', error);
		explorerStatus = 'offline';
	}

	try {
		if (info) {
			const { height, database_height } = info;
			const { itemsInPage, page } = latestBlocksInitState;

			const heightToRequest = Math.min(height, database_height);

			const response = await Fetch.getBlockDetails(
				heightToRequest - itemsInPage * page,
				itemsInPage,
			);

			if (response.success !== false && response instanceof Array) {
				latestBlocks = Utils.transformToBlocks(response, true);
			}
		}
	} catch {
		latestBlocks = [];
	}

	try {
		const response = await Fetch.getTxPoolInfo(0);

		if (response.success === false) {
			txPoolElements = [];
		} else {
			txPoolElements = response;
		}
	} catch {
		txPoolElements = [];
	}

	return {
		props: {
			visibilityInfo,
			explorerStatus,
			info,
			latestBlocks,
			txPoolElements,
		},
	};
}

export interface StatsPageProps {
	visibilityInfo: VisibilityInfo | null;
	isOnline: boolean;
	info: Info | null;
}

export async function getStats() {
	let visibilityInfo: VisibilityInfo | null = null;
	let info: Info | null = null;
	let isOnline: boolean = false;

	try {
		const response = await Fetch.getVisibilityInfo();

		if (response.success === false) {
			visibilityInfo = null;
		} else {
			visibilityInfo = response;
		}
	} catch {
		visibilityInfo = null;
	}

	try {
		const response = await Fetch.getInfo();

		if (response.success === false) {
			info = null;
			isOnline = false;
		} else {
			info = response;
			isOnline = response.status === 'OK';
		}
	} catch {
		isOnline = false;
		info = null;
	}

	return {
		props: {
			visibilityInfo,
			isOnline,
			info,
		},
	};
}

export interface TransactionPageProps extends StatsPageProps {
	transactionsData: Awaited<ReturnType<typeof Utils.fetchTransaction>>;
}

export async function getTransaction(context: GetServerSidePropsContext) {
	const stats = await getStats();

	const transactionData = await (async () => {
		const hash = context.params?.hashQuery as string | undefined;

		if (!hash) {
			return null;
		}

		const transactionInfo = await Utils.fetchTransaction(hash);

		return transactionInfo;
	})();

	return {
		props: {
			...stats.props,
			transactionsData: transactionData
				? Utils.replaceUndefinedWithNull(transactionData)
				: null,
		},
	};
}

export interface BlockPageProps extends StatsPageProps {
	blockData: Awaited<ReturnType<typeof Utils.fetchBlock>>;
}

export async function getBlock(context: GetServerSidePropsContext) {
	const stats = await getStats();

	const blockData = await (async () => {
		const hash = context.params?.hash as string | undefined;

		if (!hash) {
			return null;
		}

		const blockInfo = await Utils.fetchBlock(hash);

		return blockInfo;
	})();

	return {
		props: {
			...stats.props,
			blockData: blockData ? Utils.replaceUndefinedWithNull(blockData) : null,
		},
	};
}

export interface AliasesPageProps {
	aliasesAmount?: number;
	premiumAliasesAmount?: number;
	aliases: { alias: string; address: string; hasMatrixConnection: boolean }[];
}

export async function getAliases() {
	const countRes = await Fetch.getAliasesCount();
	const aliasesAmount = countRes?.aliasesAmount as number;
	const premiumAliasesAmount = countRes?.premiumAliasesAmount as number;

	const itemsAmount = parseInt(DEFAULT_ITEMS_ON_PAGE, 10) || 0;
	const aliasesResp = await Fetch.getAliases(0, itemsAmount, false);

	return {
		props: {
			aliasesAmount,
			premiumAliasesAmount,
			aliases: (aliasesResp || []).map(
				(e: { alias: string; address: string; hasMatrixConnection: boolean }) => ({
					alias: e.alias || ('' as string),
					address: e.address || ('' as string),
					hasMatrixConnection: e.hasMatrixConnection || (false as boolean),
				}),
			),
		},
	};
}

export type AssetType = {
	asset_id: string;
	price: number | null;
	name?: string;
	symbol?: string;
	full_name?: string;
	ticker?: string;
};

export interface AssetsPageProps {
	assetsAmount?: number;
	whitelistedAssetsAmount?: number;
	assets: AssetType[];
}

export async function getAssets() {
	const result = await Fetch.getAssetsCount();
	const assetsAmount = result?.assetsAmount;
	const whitelistedAssetsAmount = result?.whitelistedAssetsAmount;

	const assets = await Fetch.getWhitelistedAssets(0, parseInt(DEFAULT_ASSETS_ON_PAGE, 10), '');

	const zanoPrice = await Utils.getZanoPrice();

	const updatedAssets = assets.map((element: { asset_id: string; price: number | null }) => {
		if (element.asset_id === ZANO_ID) {
			return { ...element, price: zanoPrice || null };
		}
		return element;
	});

	return {
		props: {
			assetsAmount,
			whitelistedAssetsAmount,
			assets: updatedAssets || [],
		},
	};
}
