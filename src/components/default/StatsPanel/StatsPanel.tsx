import { NET_MODE } from "../../../config/config";
import Info from "../../../interfaces/state/Info";
import VisibilityInfo from "../../../interfaces/state/VisibilityInfo";
import Fetch from "../../../utils/methods";
import Utils from "../../../utils/utils";
import "./StatsPanel.scss";
import { useState, useEffect } from "react";
import { socket } from "../../../utils/socket";

function StatsPanel(props: { visibilityInfo?: VisibilityInfo | null, noStats?: boolean }) {
    const { visibilityInfo } = props;

    const [info, setInfo] = useState<Info | null>(null);
    useEffect(() => {
        socket.on("get_info", (data) => {
            try {
                data = JSON.parse(data);
                if (!data?.height) return;
                setInfo(data);
            } catch (error) {
                console.log(error);
            }
        });

        socket.emit("get-socket-info");

        return () => {
            socket.off("get_info");
        };
    }, []);


    const transactions = info ? info.height + info.tx_count : 0;

    const infoHeight = Utils.formatNumber(info?.height || 0, 0);
    const posDiff = Utils.toShiftedNumber(info?.pos_difficulty || "0", 0, 0);
    const powDiff = Utils.formatNumber(info?.pow_difficulty || 0, 0);
    const coinsEmitted = Utils.toShiftedNumber(info?.total_coins || "0", 12);
    const transactionsString = Utils.formatNumber(transactions, 0);
    const hashrate = Utils.toShiftedNumber(info?.current_network_hashrate_350 || 0, NET_MODE === "TEST" ? 0 : 9, 3);

    const stackedCoins = Utils.toShiftedNumber(visibilityInfo?.amount.toString() || "0", 12);
    const percentage = visibilityInfo?.percentage || "0";
    const devFund = Utils.toShiftedNumber(visibilityInfo?.balance.toString() || "0", 12);

    function TopItem(props: { title: string, amount: string, percent?: string }) {
        const { title, amount, percent } = props;

        return (
            <div className="main__top__item">
                <div>
                    <p>{title}</p>
                </div>
                <div className="item__value">
                    <p>{amount + " ZANO"}</p>
                    {percent &&
                        <div>
                            <div>
                                <p>
                                    {percent + "%"}
                                </p>
                            </div>
                            <p>from total supply</p>
                        </div>
                    }
                </div>
            </div>
        )
    }


    function BottomItem(props: { title: string, children: React.ReactNode }) {
        const { title, children } = props;

        return (
            <div className="main__bottom__item">
                <div>
                    <p>{title}</p>
                </div>
                <div className="bottom__item__value">
                    {children}
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="blockchain__info__main">
                {NET_MODE === "MAIN" && !props.noStats &&
                    <div className="info__main__top">
                        <TopItem 
                            title="Staked Coins (est)" 
                            amount={stackedCoins}
                            percent={percentage}
                        />
                        <TopItem 
                            title="Dev Fund" 
                            amount={devFund}
                        />
                    </div>
                }
                <div className="info__main__bottom">
                    <BottomItem title="Height">
                        <p className="item__text__large">{infoHeight}</p>
                    </BottomItem>
                    <BottomItem title="Difficulty">
                        <div className="item__difficulty">
                            <div>
                                <p>PoS: {posDiff}</p>
                            </div>
                        
                            <div>
                                <p>PoW: {powDiff}</p>
                            </div>
                        </div>
                    </BottomItem>
                    <BottomItem title="Coins Emitted">
                        <p className="item__text__small">{coinsEmitted}</p>
                    </BottomItem>
                    <BottomItem title="Transactions">
                        <p className="item__text__large">{transactionsString}</p>
                    </BottomItem>
                    <BottomItem title="Hash Rate (aprox):">
                        <p className="item__text__large">{hashrate} GH/sec</p>
                    </BottomItem>
                </div>
            </div>


            
            <div className="info__main__mobile">
                {NET_MODE === "MAIN" &&
                    <div className="info__main__top">
                        <TopItem 
                            title="Staked Coins (est)" 
                            amount={stackedCoins}
                            percent={percentage}
                        />
                        <TopItem 
                            title="Dev Fund" 
                            amount={devFund}
                        />
                    </div>
                }
                <div className="info__main__bottom">
                    <BottomItem title="Height">
                        <p className="item__text__large">{infoHeight}</p>
                    </BottomItem>
                    <BottomItem title="Difficulty">
                        <div className="item__difficulty">
                            <div>
                                <p>PoS: {posDiff}</p>
                            </div>
                        
                            <div>
                                <p>PoW: {powDiff}</p>
                            </div>
                        </div>
                    </BottomItem>
                    <BottomItem title="Coins Emitted">
                        <p className="item__text__small">{coinsEmitted}</p>
                    </BottomItem>
                    <BottomItem title="Transactions">
                        <p className="item__text__large">{transactionsString}</p>
                    </BottomItem>
                    <BottomItem title="Hash Rate (aprox):">
                        <p className="item__text__large">{hashrate} GH/sec</p>
                    </BottomItem>
                </div>
            </div>
        </>
    )
}

export default StatsPanel;