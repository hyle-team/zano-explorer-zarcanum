import Fetch from '@/utils/methods';
import Blockchain from './Blockchain/index';
import { GetServerSideProps } from 'next'
import VisibilityInfo from '@/interfaces/state/VisibilityInfo';
import Info from '@/interfaces/state/Info';
import Block from '@/interfaces/state/Block';
import { latestBlocksInitState } from './Blockchain/components/LatestBlocks/LatestBlocks';
import Utils from '@/utils/utils';
import { PoolElement } from './Blockchain/components/TransactionPool/TransactionPool';

export interface MainPageProps {
    visibilityInfo: VisibilityInfo | null;
    isOnline: boolean;
    info: Info | null;
    latestBlocks: Block[];
    txPoolElements: PoolElement[]
}

function MainPage({ visibilityInfo, isOnline, info, latestBlocks, txPoolElements }: MainPageProps) {
    return (
        <Blockchain
            fetchedVisibilityInfo={visibilityInfo}
            fetchedIsOnline={isOnline}
            fetchedInfo={info}
            fetchedLatestBlocks={latestBlocks}
            fetchedTxPoolElements={txPoolElements}
        />
    );
}

const getServerSideProps: GetServerSideProps = async () => {

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

export { getServerSideProps };

export default MainPage;