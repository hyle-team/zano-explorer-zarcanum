import styles from "@/styles/Blockchain.module.scss";
import Header from "@/components/default/Header/Header";
import StatsPanel from "@/components/default/StatsPanel/StatsPanel";
import InfoTopPanel from "@/components/default/InfoTopPanel/InfoTopPanel";
import LatestBlocks from "./components/LatestBlocks/LatestBlocks";
import TransactionPool from "./components/TransactionPool/TransactionPool";
import { useEffect, useState } from "react";
import Fetch from "@/utils/methods";
import VisibilityInfo from "@/interfaces/state/VisibilityInfo";

function Blockchain() {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [visibliltyInfo, setVisibilityInfo] = useState<VisibilityInfo | null>(null);
    const [isOnline, setIsOnline] = useState(true);

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
            <StatsPanel visibilityInfo={visibliltyInfo} />
            <LatestBlocks />
            <TransactionPool />
        </div>
    )
}

export default Blockchain;