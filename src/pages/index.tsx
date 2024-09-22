import Blockchain from './Blockchain/index';
import { GetServerSideProps } from 'next'
import VisibilityInfo from '@/interfaces/state/VisibilityInfo';
import Info from '@/interfaces/state/Info';
import Block from '@/interfaces/state/Block';
import { PoolElement } from './Blockchain/components/TransactionPool/TransactionPool';
import { getMainPageProps } from '@/utils/ssr';

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

const getServerSideProps: GetServerSideProps = getMainPageProps;
export { getServerSideProps };

export default MainPage;