import { NET_MODE } from "../../../config/config";
import Info from "../../../interfaces/state/Info";
import VisibilityInfo from "../../../interfaces/state/VisibilityInfo";
import Fetch from "../../../utils/methods";
import Utils from "../../../utils/utils";
import "./StatsPanel.scss";
import { useState, useEffect, ReactNode } from "react";
import { socket } from "../../../utils/socket";
import { ReactComponent as BurnImg } from "../../../assets/images/UI/flame_ico.svg";

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


    const transactions = info ? info.height + info.tx_count : undefined;

    const infoHeight = Utils.formatNumber(info?.height, 0) || "...";
    const posDiff = Utils.toShiftedNumber(info?.pos_difficulty, 0, 0) || "...";
    const powDiff = Utils.formatNumber(info?.pow_difficulty, 0) || "...";
    const coinsEmitted = Utils.toShiftedNumber(info?.total_coins, 12) || "...";
    const transactionsString = Utils.formatNumber(transactions, 0) || "...";
    const hashrate = Utils.toShiftedNumber(info?.current_network_hashrate_350, NET_MODE === "TEST" ? 0 : 9, 3) || "...";

    const stackedCoins = Utils.toShiftedNumber(visibilityInfo?.amount.toString(), 12) || "...";
    const percentage = visibilityInfo?.percentage || "...";
    const APY = visibilityInfo?.apy ? parseFloat((visibilityInfo?.apy || 0).toFixed(4)) : "...";
    const devFund = Utils.toShiftedNumber(visibilityInfo?.balance.toString(), 12) || "...";
    const zanoBurned = visibilityInfo?.zano_burned ?? "...";
    const posValue = visibilityInfo?.pos_value
        ? Utils.formatNumber(visibilityInfo?.pos_value, 3) || "..."
        : "...";

    function TopItem(props: { title: string, amount: string | ReactNode, percent?: string, customCurrency?: boolean }) {
        const { title, amount, percent, customCurrency } = props;

        const isAmountString = typeof amount === "string";
        
        return (
            <div className="main__top__item">
                <div>
                    <p className="main__top__item__header">{title}</p>
                </div>
                <div className="item__value">
                    {isAmountString 
                        ? <p>{amount + (!customCurrency ? " ZANO" : "")}</p> 
                        : amount
                    }
                    {percent &&
                        <div className="item__precent">
                            <div>
                                <p>
                                    {percent + "%"}
                                </p>
                            </div>
                            <p className="item__precent__label">from total supply</p>
                        </div>
                    }
                </div>
            </div>
        )
    }


    function BottomItem(props: { title: string, children: React.ReactNode, style?: React.CSSProperties }) {
        const { title, children, style } = props;

        return (
            <div className="main__bottom__item" style={style}>
                <div>
                    <p>{title}</p>
                </div>
                <div className="bottom__item__value">
                    {children}
                </div>
            </div>
        )
    }

    function InfoTop() {
        return (
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
            <TopItem 
                title="Real Time APY" 
                amount={`${APY}%`}
                customCurrency={true}
            />
            <TopItem 
                title="Zano Burned" 
                amount={
                    <div className="item__value__burn">
                        <BurnImg />
                        <p>{zanoBurned} ZANO</p>
                    </div>
                }
            />
        </div>
        );
    }

    return (
        <>
            <div className="blockchain__info__main">
                {NET_MODE === "MAIN" && !props.noStats && <InfoTop/>}
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
                    <BottomItem title="Hash Rate (aprox):" style={{ 'flexBasis': '27%' }}>
                        <div className="item__difficulty">
                            <div>
                                <p>PoS: {posValue} block/day stake</p>
                            </div>
                        
                            <div>
                                <p>PoW: {hashrate} GH/sec</p>
                            </div>
                        </div>
                    </BottomItem>
                </div>
            </div>


            
            <div className="info__main__mobile">
                {NET_MODE === "MAIN" && <InfoTop/>}
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
                    <BottomItem title="Hash Rate (aprox):" style={{ 'flexBasis': '27%' }}>

                        <div className="item__difficulty">
                            <div>
                                <p>PoS: {posValue} block/day stake</p>
                            </div>
                        
                            <div>
                                <p>PoW: {hashrate} GH/sec</p>
                            </div>
                        </div>
                    </BottomItem>
                </div>
            </div>
        </>
    )
}

export default StatsPanel;