import "../../styles/Blockchain.scss";
import Header from "../../components/default/Header/Header";
import StatsPanel from "../../components/default/StatsPanel/StatsPanel";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import LatestBlocks from "./components/LatestBlocks/LatestBlocks";
import TransactionPool from "./components/TransactionPool/TransactionPool";
import { useEffect, useState } from "react";
import Fetch from "../../utils/methods";
import VisibilityInfo from "../../interfaces/state/VisibilityInfo";

function Blockchain() {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [visibliltyInfo, setVisibilityInfo] = useState<VisibilityInfo | null>(null);

    useEffect(() => {
        async function fetchVisibilityInfo() {
            const result = await Fetch.getVisibilityInfo();
            if (result.success === false) return;
            setVisibilityInfo(result);
        }

        fetchVisibilityInfo();
    }, []);

    return (
        <div className="blockchain">
            <Header 
                page="Blockchain" 
                burgerOpened={burgerOpened} 
                setBurgerOpened={setBurgerOpened} 
            />
            <InfoTopPanel 
                burgerOpened={burgerOpened} 
                title="Blockchain" 
                content={
                    <div className="info__top__daemon">
                        <p>Daemon state: Online</p>
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