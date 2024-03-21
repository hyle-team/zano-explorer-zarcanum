import "../../styles/Block.scss";
import Header from "../../components/default/Header/Header";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import StatsPanel from "../../components/default/StatsPanel/StatsPanel";
import { useEffect, useState } from "react";
import Table from "../../components/default/Table/Table";
import { ReactComponent as ArrowImg } from "../../assets/images/UI/arrow.svg";
import BlockInfo from "../../interfaces/common/BlockInfo";
import Utils from "../../utils/utils";
import { useParams } from "react-router-dom";
import Fetch from "../../utils/methods";
import Popup from "../../components/default/Popup/Popup";

interface Transaction {
    hash: string;
    amount: string;
    fee: string;
    size: string;
}

function Block(props: { alt?: boolean }) {
    const { alt } = props;

    const [burgerOpened, setBurgerOpened] = useState(false);
    const [jsonPopupOpened, setJsonPopupOpened] = useState(false);

    const { hash } = useParams();

    const tableHeaders = [ "HASH", "FEE", "TOTAL AMOUNT", "SIZE" ];


    const [blockInfo, setBlockInfo] = useState<BlockInfo | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    

    const tableElements = transactions.map(e => [
        !alt 
        ? 
        (
            <a href={"/transaction/" + (e.hash || "")} className="block__table__hash">
                {e.hash}
            </a>
        )
        : 
        (
            <p className="block__table__hash">{e.hash}</p>
        ),
        e.fee,
        e.amount,
        e.size + " bytes"
    ]);

    const [height, setHeight] = useState<number | null>(null);

    const [prevHash, setPrevHash] = useState<string | null>(null);
    const [nextHash, setNextHash] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHash() {
            if (!height) return;
            const prevHashFetched = await Fetch.getHashByHeight(height - 1);
            const nextHashFetched = await Fetch.getHashByHeight(height + 1);
            setPrevHash(prevHashFetched);
            setNextHash(nextHashFetched);
        }
        
        fetchHash();
    }, [height]);

    useEffect(() => {
        async function fetchBlock() {
            if (!hash) return;
            setBlockInfo(null);
            const result = await Fetch.getBlockInfo(hash, alt);

            if (result.success === false) return;

            setHeight(result.height || null);
            
            setBlockInfo({
                type: result.type === 1 ? "PoW" : "PoS",
                timestamp: result.timestamp || undefined,
                actualTimestamp: result.actual_timestamp || undefined,
                difficulty: Utils.formatNumber(result.difficulty || "", 0),
                minerTextInfo: result.miner_text_info || undefined,
                cummulativeDiffAdjusted: Utils.formatNumber(result.cumulative_diff_adjusted || "", 0),
                cummulativeDiffPresize: Utils.formatNumber(result.cumulative_diff_precise || "", 0),
                orphan: result.is_orphan || false,
                baseReward: Utils.toShiftedNumber(result.base_reward || "0", 12),
                transactionsFee: Utils.formatNumber(result.total_fee || "0", 12),
                rewardPenalty: "",
                reward: Utils.toShiftedNumber(result.summary_reward || "0", 12),
                totalBlockSize: result.block_tself_size || undefined,
                effectiveTxsMedian: undefined,
                blockFeeMedian: Utils.toShiftedNumber(result.this_block_fee_median || "0", 12),
                effectiveFeeMedian: Utils.toShiftedNumber(result.effective_fee_median || "0", 12),
                currentTxsMedian: undefined,
                transactions: result.tr_count || "0",
                transactionsSize: result.total_txs_size || "0",
                alreadyGeneratedCoins: result.already_generated_coins || undefined, 
                object_in_json: result.object_in_json || undefined,
                id: result.id || undefined,
                prev_id: result.prev_id || undefined,
                minor_version: result?.object_in_json?.split('\"minor_version\": ')?.[1]?.split(',')?.[0] || '-',
                major_version: result?.object_in_json?.split('\"major_version\": ')?.[1]?.split(',')?.[0] || '-',
            }); 

            const rawTransactionsDetails = result.transactions_details;

            const transactionsDetails = 
                typeof rawTransactionsDetails === "string" 
                ? (() => {
                    try {
                        return JSON.parse(rawTransactionsDetails);
                    } catch {}
                })() 
                : rawTransactionsDetails;

            if (!(transactionsDetails instanceof Array)) return;

            setTransactions(
                transactionsDetails.map(e => ({
                    hash: e?.id || "",
                    fee: Utils.toShiftedNumber(e?.fee || "0", 12),
                    amount: Utils.toShiftedNumber(e?.amount?.toString() || "0", 12),
                    size: e?.blob_size || "0"
                }))
            );
        }

        fetchBlock();
    }, [hash]);
    
    function BlockInfo() {
        
        function JsonPopup() {
            return (
                <div className="block__info__json">
                    {/* <button>x</button> */}
                    <div className="block__info__json__content">
                        {blockInfo?.object_in_json || ''}
                    </div>
                </div>
            );
        }

        return (
            <div className="block__info">
                {jsonPopupOpened && 
                    <Popup 
                        Content={JsonPopup}
                        close={() => setJsonPopupOpened(false)}
                        settings={{

                        }}
                        scroll
                        blur
                        classList={["block__json_popup"]}
                    />
                }
                <div className="block__info__title">
                    <h2>Zano Block</h2>
                    <div>
                        {!alt && prevHash !== "" &&
                            <a href={prevHash ? "/block/" + prevHash : undefined}> 
                                <ArrowImg />
                            </a>
                        }
                        <h2>{height}</h2>
                        {!alt && nextHash !== "" &&
                            <a href={nextHash ? "/block/" + nextHash : undefined}>
                                <ArrowImg />
                            </a>
                        }
                    </div>
                    <p>{hash?.toUpperCase() || ""}</p>
                </div>
                <div className="block__info__table">
                    <table>
                        <tbody>
                            <tr>
                                <td>Type:</td>
                                <td>
                                    <span 
                                        className={`block__info__type ${blockInfo?.type === "PoS" ? "type__pos" : "type__pow"}`}
                                    >
                                        {blockInfo?.type ?? "-"}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td>Timestamp (UTC):</td>
                                <td>{blockInfo?.timestamp ? Utils.formatTimestampUTC(blockInfo?.timestamp) : "-"}</td>
                            </tr>
                            <tr>
                                <td>ID</td>
                                <td><a href="">{Utils.shortenAddress(blockInfo?.id ?? "-")}</a></td>
                            </tr>
                            <tr>
                                <td>Actual Timestamp (UTC):</td>
                                <td>{blockInfo?.actualTimestamp ? Utils.formatTimestampUTC(blockInfo?.actualTimestamp) : "-"}</td>
                            </tr>
                            <tr>
                                <td>Difficulty:</td>
                                <td>{blockInfo?.difficulty ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Miner text info:</td>
                                <td>{blockInfo?.minerTextInfo ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Cumulative diff adjusted:</td>
                                <td>{blockInfo?.cummulativeDiffAdjusted ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Cumulative diff presize:</td>
                                <td>{blockInfo?.cummulativeDiffPresize ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Orphan:</td>
                                <td>{blockInfo?.orphan ? "yes" : "no"}</td>
                            </tr>
                            <tr>
                                <td>Base reward:</td>
                                <td>{blockInfo?.baseReward ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Transactions fee:</td>
                                <td>{blockInfo?.transactionsFee ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Major / Minor versions:</td>
                                <td>{blockInfo?.major_version ?? "-"} / {blockInfo?.minor_version ?? "-"}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table>
                        <tbody>
                            <tr>
                                <td>Reward penalty:</td>
                                <td>{blockInfo?.rewardPenalty ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Reward:</td>
                                <td>{blockInfo?.reward || "-"}</td>
                            </tr>
                            <tr>
                                <td>Previous ID:</td>
                                <td><a href={`/block/${blockInfo?.prev_id}`}>{Utils.shortenAddress(blockInfo?.prev_id ?? "-")}</a></td>
                            </tr>
                            <tr>
                                <td>Total block size, bytes:</td>
                                <td>{blockInfo?.totalBlockSize ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Effective txs median, bytes:</td>
                                <td>{blockInfo?.effectiveTxsMedian ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>This block fee median</td>
                                <td>{blockInfo?.blockFeeMedian ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Effective fee median</td>
                                <td>{blockInfo?.effectiveFeeMedian ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Current txs median, bytes:</td>
                                <td>{blockInfo?.currentTxsMedian ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Transactions:</td>
                                <td>{blockInfo?.transactions ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Total transactions size, bytes:</td>
                                <td>{blockInfo?.transactionsSize ?? "-"}</td>
                            </tr>
                            <tr>
                                <td>Seed</td>
                                <td>{blockInfo?.seed ?? ""}</td>
                            </tr>
                            <tr>
                                <td>JSON data:</td>
                                <td>
                                    <a 
                                        href="/" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setJsonPopupOpened(true);
                                        }}
                                    >
                                        [ &nbsp;view &nbsp;]
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
        )
    }
    
    return (
        <div className="block">
            <Header
                page="Blockchain" 
                burgerOpened={burgerOpened} 
                setBurgerOpened={setBurgerOpened} 
            />
            <InfoTopPanel 
                burgerOpened={burgerOpened} 
                title=""
                back
                className="block__info__top"
            />
            <StatsPanel noStats={true}/>
            <BlockInfo />
            <div className="block__transactions">
                <h2>Transactions</h2>
                <Table 
                    headers={tableHeaders}
                    elements={tableElements}
                />
            </div>
        </div>
    )
}

export default Block;