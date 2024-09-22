import styles from "@/styles/Blockchain.module.scss";
import Header from "@/components/default/Header/Header";
import StatsPanel from "@/components/default/StatsPanel/StatsPanel";
import InfoTopPanel from "@/components/default/InfoTopPanel/InfoTopPanel";
import LatestBlocks from "./components/LatestBlocks/LatestBlocks";
import TransactionPool, { PoolElement } from "./components/TransactionPool/TransactionPool";
import { useEffect, useState } from "react";
import Fetch from "@/utils/methods";
import VisibilityInfo from "@/interfaces/state/VisibilityInfo";
import Info from "@/interfaces/state/Info";
import Block from "@/interfaces/state/Block";

function Blockchain({
    fetchedVisibilityInfo,
    fetchedIsOnline,
    fetchedInfo,
    fetchedLatestBlocks,
    fetchedTxPoolElements, 
}: {
    fetchedVisibilityInfo: VisibilityInfo | null,
    fetchedInfo: Info | null,
    fetchedIsOnline: boolean,
    fetchedLatestBlocks: Block[],
    fetchedTxPoolElements: PoolElement[],
}) {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [visibilityInfo, setVisibilityInfo] = useState<VisibilityInfo | null>(fetchedVisibilityInfo);
    const [isOnline, setIsOnline] = useState(fetchedIsOnline);

    useEffect(() => {
        async function fetchVisibilityInfo() {
            const result = await Fetch.getVisibilityInfo();
            if (result.success === false) return;
            setVisibilityInfo(result);
        }

        async function checkOnline() {
            try {
                const result = await Fetch.getInfo();
                if (result.status === "OK") {
                    setIsOnline(true);
                } else {
                    setIsOnline(false);
                }
            } catch (error) {
                console.log(error);
                setIsOnline(false);
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
                        <p>Daemon state: {isOnline ? 'Online' : 'Offline'}</p>
                        <p>Default network fee: 0,01</p>
                        <p>Minimum network fee: 0,01</p>
                    </div>
                }
            />
            <StatsPanel visibilityInfo={visibilityInfo} fetchedInfo={fetchedInfo} />
            <LatestBlocks
                fetchedLatestBlocks={fetchedLatestBlocks}
                fetchedInfo={fetchedInfo}
            />
            <TransactionPool
                fetchedTxPoolElements={fetchedTxPoolElements}
            />
        </div>
    )
}

export default Blockchain;