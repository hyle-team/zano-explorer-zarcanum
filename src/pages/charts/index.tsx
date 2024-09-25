import styles from "@/styles/Charts.module.scss";
import { useState, useEffect } from "react";
import Header from "@/components/default/Header/Header";
import InfoTopPanel from "@/components/default/InfoTopPanel/InfoTopPanel";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { chartOptions } from "@/utils/constants";
import Utils from "@/utils/utils";
import ChartSeriesElem from "@/interfaces/common/ChartSeriesElem";
import Preloader from "@/components/UI/Preloader/Preloader";
import Link from "next/link";

function Charts() {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [chartsSeries, setChartsSeries] = useState<{ [key: string]: ChartSeriesElem[][] | undefined }>(
        {
            "avg-block-size": undefined,
            "avg-trans-per-block": undefined,
            "hash-rate": undefined,
            "difficulty-pow": undefined,
            "difficulty-pos": undefined,
            "confirm-trans-per-day": undefined
        }
    );
    

    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function fetchCharts() {
            setLoaded(false);

            const titles = [
                "avg-block-size",
                "avg-trans-per-block",
                "hash-rate",
                "difficulty-pow",
                "difficulty-pos",
                "confirm-trans-per-day"
            ];

            const chartPeriod = 7 * 24 * 60 * 60 * 1e3;
            const offset = +new Date(1680695278000) - chartPeriod;
    
            await Promise.all(titles.map(async title => {
                const result = await Utils.fetchChartInfo(title, offset);
                if (title === "hash-rate") {
                    console.log("hash-rate", result);
                }
                console.log(result);
                
                if (!result) return;

                setChartsSeries(prev => ({ 
                    ...prev, 
                    [title]: result.map(
                        series => series.filter(e => e.x > offset - chartPeriod)
                    ) 
                }))
            }));
                
            setLoaded(true);
        }

        fetchCharts();
    }, []);

    function Chart(props: { title: string, requestTitle: string }) {
        const {
            title,
            requestTitle
        } = props;

        return (
            <Link href={"/chart/" + requestTitle} className={styles["charts__chart__wrapper"]}>
                <div className={styles["charts__chart__title"]}>
                    <p>{title}</p>
                </div>
                <HighchartsReact 
                    highcharts={Highcharts}
                    options={{
                        ...chartOptions,
                        title: {
                            text: undefined
                        },
                        series: chartsSeries[requestTitle]?.map(e => ({
                            type: "line",
                            data: e,
                            turboThreshold: 0,
                            animation: false
                        })),
                        chart: {
                            ...chartOptions.chart,
                            height: 280,
                            className: styles["charts__chart"]
                        },
                        tooltip: {
                            enabled: false
                        },
                        legend: {
                            enabled: false
                        },
                        yAxis: {
                            ...chartOptions.yAxis,
                            title: {
                                text: ""
                            }
                        },
                        plotOptions: {
                            area: {
                                lineWidth: 2,
                                states: {
                                    hover: {
                                        lineWidth: 1
                                    }
                                },
                                threshold: null
                            },
                            series: {
                                marker: {
                                    enabled: false
                                }
                            }      
                        }
                    }}
                />
            </Link>
            
        )
    }

    return (
        <div className={styles["charts"]}>
            <Header 
                page="Charts" 
                burgerOpened={burgerOpened} 
                setBurgerOpened={setBurgerOpened} 
            />
            <InfoTopPanel 
                burgerOpened={burgerOpened} 
                title="Charts" 
            />
            {loaded ?
                <div className={styles["charts__container"]}>
                    <Chart 
                        title="Average Block Size"
                        requestTitle="avg-block-size"
                    />
                    <Chart 
                        title="Average Number Of Transactions Per Block"
                        requestTitle="avg-trans-per-block"
                    />
                    <Chart 
                        title="Hash Rate" 
                        requestTitle="hash-rate"
                    />
                    <Chart 
                        title="PoW Difficulty" 
                        requestTitle="difficulty-pow"
                    />
                    <Chart 
                        title="PoS Difficulty" 
                        requestTitle="difficulty-pos"
                    />
                    <Chart 
                        title="Confirmed Transaction Per Day"
                        requestTitle="confirm-trans-per-day" 
                    />
                </div> : 
                <div className={styles["charts__preloader"]}>
                    <Preloader />
                </div>
            }
        </div>
    )
}

export default Charts;