import VisibilityInfo from "@/interfaces/state/VisibilityInfo";
import Fetch from "./methods";
import Block from "@/interfaces/state/Block";
import { PoolElement } from "@/pages/Blockchain/components/TransactionPool/TransactionPool";
import Info from "@/interfaces/state/Info";
import { latestBlocksInitState } from "@/pages/Blockchain/components/LatestBlocks/LatestBlocks";
import Utils from "./utils";
import { DEFAULT_ITEMS_ON_PAGE } from "@/pages/aliases";
import { DEFAULT_ASSETS_ON_PAGE } from "@/pages/assets";
import { ZANO_ID } from "./constants";
import { GetServerSidePropsContext } from "next";

export async function getMainPageProps() {

    let visibilityInfo: VisibilityInfo | null = null;
    let info: Info | null = null;
    let latestBlocks: Block[] = [];
    let isOnline: boolean = false;
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
            isOnline = false;
        } else {
            info = response;
            isOnline = response.status === "OK";
        }
    } catch {
        isOnline = false;
        info = null;
    }

    try {
        if (info) {
            const { height } = info;
            const { itemsInPage, page } = latestBlocksInitState;
            const response = await Fetch.getBlockDetails(height - itemsInPage * page, itemsInPage);

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
            isOnline,
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
            isOnline = response.status === "OK";
        }
    } catch {
        isOnline = false;
        info = null;
    }

    return {
        props: {
            visibilityInfo,
            isOnline,
            info
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
            transactionsData: Utils.replaceUndefinedWithNull(transactionData)
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
            blockData: Utils.replaceUndefinedWithNull(blockData)
        },
    };
}

export interface AliasesPageProps {
    aliasesAmount?: number;
    premiumAliasesAmount?: number;
    aliases: { alias: string, address: string }[];
}

export async function getAliases() {

    const countRes = await Fetch.getAliasesCount();
    const aliasesAmount = countRes?.aliasesAmount as number;
    const premiumAliasesAmount = countRes?.premiumAliasesAmount as number;

    const itemsAmount = parseInt(DEFAULT_ITEMS_ON_PAGE, 10) || 0;
    const aliasesResp = await Fetch.getAliases(0, itemsAmount, undefined);


    return {
        props: {
            aliasesAmount,
            premiumAliasesAmount,
            aliases: (aliasesResp || []).map((e: any) => ({
                alias: e.alias || "" as string, 
                address: e.address || "" as string
            }))
        },
    };
}

export interface AssetsPageProps {
    assetsAmount?: number;
    whitelistedAssetsAmount?: number;
    assets: any[];
}

export async function getAssets() {
    const result = await Fetch.getAssetsCount();
    const assetsAmount = result?.assetsAmount;
    const whitelistedAssetsAmount = result?.whitelistedAssetsAmount;


    const assets = await Fetch.getWhitelistedAssets(0, parseInt(DEFAULT_ASSETS_ON_PAGE, 10), "")  

    const zanoPrice = await Utils.getZanoPrice();

    assets.forEach((element: any) => {
        if (element.asset_id === ZANO_ID) {
            element.price = zanoPrice;
        }
    });

    return {
        props: {
            assetsAmount,
            whitelistedAssetsAmount,
            assets: assets || []
        },
    };
}