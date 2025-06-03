import styles from "@/styles/Blockchain.module.scss";
import Header from "@/components/default/Header/Header";
import StatsPanel from "@/components/default/StatsPanel/StatsPanel";
import InfoTopPanel from "@/components/default/InfoTopPanel/InfoTopPanel";
import LatestBlocks from "@/components/default/LatestBlocks/LatestBlocks";
import TransactionPool, { PoolElement } from "@/components/default/TransactionPool/TransactionPool";
import { useEffect, useState } from "react";
import Fetch from "@/utils/methods";
import VisibilityInfo from "@/interfaces/state/VisibilityInfo";
import Info from "@/interfaces/state/Info";
import Block, { ExplorerStatusType } from "@/interfaces/state/Block";
import { GetServerSideProps } from "next";
import { getMainPageProps } from "@/utils/ssr";
import { classes } from "@/utils/utils";
export interface MainPageProps {
    visibilityInfo: VisibilityInfo | null;
    isOnline: boolean;
    info: Info | null;
    latestBlocks: Block[];
    txPoolElements: PoolElement[]
}

function MainPage({ visibilityInfo: fetchedVisibilityInfo, isOnline: fetchedIsOnline, info, latestBlocks, txPoolElements }: MainPageProps) {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [visibilityInfo, setVisibilityInfo] = useState<VisibilityInfo | null>(fetchedVisibilityInfo);
    const [explorerStatus, setExplorerStatus] = useState<ExplorerStatusType>(fetchedIsOnline ? "online" : "offline");

    useEffect(() => {
        async function fetchVisibilityInfo() {
            const result = await Fetch.getVisibilityInfo();
            if (result.success === false) return;
            setVisibilityInfo(result);
        }

        async function checkOnline() {

            try {
                setExplorerStatus("syncing");
                const result = await Fetch.getInfo();
                if (result.status === "OK") {
                    setExplorerStatus("online");
                } else {
                    setExplorerStatus("offline");
                }
            } catch (error) {
                console.log(error);
                setExplorerStatus("offline");
            }
        }

        fetchVisibilityInfo();
        const interval = setInterval(checkOnline, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles["blockchain"]}>
            <Header
                page="Blockchain"
                burgerOpened={burgerOpened}
                setBurgerOpened={setBurgerOpened}
            />
            <InfoTopPanel
                burgerOpened={burgerOpened}
                title="Blockchain"
                content={
                    <div className={styles["info__top__daemon"]}>
                        <p className={styles["info__top__daemon_item"]}>Explorer state:
                            <span className={classes(styles["explorer__status"], styles[explorerStatus])}>
                                <span className={styles["status__item"]} /> {explorerStatus}
                            </span>
                        </p>
                        <p className={styles["info__top__daemon_item"]}>Default network fee: 0,01</p>
                        <p className={styles["info__top__daemon_item"]}>Minimum network fee: 0,01</p>
                    </div>
                }
            />
            <StatsPanel visibilityInfo={visibilityInfo} fetchedInfo={info} />
            <LatestBlocks
                fetchedLatestBlocks={latestBlocks}
                fetchedInfo={info}
            />
            <TransactionPool
                fetchedTxPoolElements={txPoolElements}
            />
        </div>
    )
}

const getServerSideProps: GetServerSideProps = getMainPageProps;
export { getServerSideProps };

export default MainPage;