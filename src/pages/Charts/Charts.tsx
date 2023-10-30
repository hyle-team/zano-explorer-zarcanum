import "../../styles/Charts.scss";
import { useState, useEffect } from "react";
import Header from "../../components/default/Header/Header";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { chartOptions } from "../../utils/constants";
import Utils from "../../utils/utils";
import ChartSeriesElem from "../../interfaces/common/ChartSeriesElem";
import Preloader from "../../components/UI/Preloader/Preloader";

function Charts() {
    const [burgerOpened, setBurgerOpened] = useState(false);

    function Chart(props: { title: string, requestTitle: string }) {
        const {
            title,
            requestTitle
        } = props;

        const [chartSeries, setChartSeries] = useState<ChartSeriesElem[][]>([]);

        useEffect(() => {
            async function fetchChart() {
                const dayMs = 24 * 60 * 60 * 1e3;
                const now = Date.now();
                const chartId = requestTitle;
                if (!chartId) return;
                const result = await Utils.fetchChartInfo(chartId);
                if (!result) return;
                setChartSeries(
                    result.map(
                        series => series.filter(e => e.x > now - dayMs)
                    )
                );
            }

            fetchChart();
        }, []);

        return (
            <a href={"/charts/" + requestTitle} className="charts__chart__wrapper">
                <div className="charts__chart__title">
                    <p>{title}</p>
                </div>
                <HighchartsReact 
                    highcharts={Highcharts}
                    options={{
                        ...chartOptions,
                        title: {
                            text: undefined
                        },
                        series: chartSeries.map(e => ({
                            type: "line",
                            data: e,
                            turboThreshold: 0,
                        })),
                        chart: {
                            ...chartOptions.chart,
                            height: 280,
                            className: "charts__chart"
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
            </a>
            
        )
    }

    return (
        <div className="charts">
            <Header 
                page="Charts" 
                burgerOpened={burgerOpened} 
                setBurgerOpened={setBurgerOpened} 
            />
            <InfoTopPanel 
                burgerOpened={burgerOpened} 
                title="Charts" 
            />
            <div className="charts__container">
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
            </div>
        </div>
    )
}

export default Charts;