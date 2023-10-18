import "../../styles/Transaction.scss";
import { useEffect, useState } from "react";
import Header from "../../components/default/Header/Header";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import StatsPanel from "../../components/default/StatsPanel/StatsPanel";
import Table from "../../components/default/Table/Table";
import TransactionInfo from "../../interfaces/common/TransactionInfo";
import Fetch from "../../utils/methods";
import { useParams } from "react-router-dom";
import Utils from "../../utils/utils";
import { nanoid } from "nanoid";

interface Block {
    hash: string;
    height: string;
    timestamp: string;
}



function Transaction() {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [transactionInfo, setTransactionInfo] = useState<TransactionInfo | null>(null);
    const [blockOrigin, setBlockOrigin] = useState<Block | null>(null);

    const { hash } = useParams();

    useEffect(() => {
        async function fetchTransaction() {
            if (!hash) return;
            const result = await Fetch.getTransaction(hash);
            if (result.success === false) return;
            if (!(typeof result === "object")) return;
            const newTransactionInfo: TransactionInfo = {
                hash: result.id || "",
                amount: Utils.toShiftedNumber(result.amount || "0", 12),
                fee: Utils.toShiftedNumber(result.fee || "0", 0),
                size: result.block_size || "0",
                confirmations: "-",
                publicKey: result.pub_key || "-",
                mixin: "-",
                extraItems: [],
                attachments: undefined
            }
            setBlockOrigin({
                hash: result.block_hash || "",
                height: Utils.formatNumber(result.keeper_block || "0", 0),
                timestamp: result.timestamp || ""
            });
            
            try {
                const parsedExtraItems = JSON.parse(result.extra);
                if (parsedExtraItems instanceof Array) {
                    newTransactionInfo.extraItems = parsedExtraItems.map(e => {
                        return `(${e.type || ""}) ${e.short_view || ""}`;
                    });
                }
            } catch {}

            setTransactionInfo(newTransactionInfo);
        }

        fetchTransaction();
    }, []);

    return (
        <div className="transaction">
            <Header 
                burgerOpened={burgerOpened}
                setBurgerOpened={setBurgerOpened}
                page="Blockchain"
            />
            <InfoTopPanel 
                burgerOpened={burgerOpened} 
                title=""
                back
                className="block__info__top"
            />
            <StatsPanel onlyBottom />
            <div className="transaction__info">
                <h2>Transaction</h2>
                <table>
                    <tbody>
                        <tr>
                            <td>Hash</td>
                            <td>{transactionInfo?.hash || "-"}</td>
                        </tr>
                        <tr>
                            <td>Amount</td>
                            <td>{transactionInfo?.amount || "-"}</td>
                        </tr>
                        <tr>
                            <td>Fee</td>
                            <td>{transactionInfo?.fee || "-"}</td>
                        </tr>
                        <tr>
                            <td>Size</td>
                            <td>{(transactionInfo?.size || "0") + " bytes"}</td>
                        </tr>
                        <tr className="transaction__confirmation">    
                            <td>Confirmations</td>
                            <td>{transactionInfo?.confirmations || "0"}</td>
                        </tr>
                        <tr>
                            <td>One-time public key</td>
                            <td>{transactionInfo?.publicKey || "-"}</td>
                        </tr>
                        <tr>
                            <td>Mixin</td>
                            <td>{transactionInfo?.mixin || "-"}</td>
                        </tr>
                        <tr className="transaction__extra_items">
                            <td>Extra items</td>
                            <td>
                                {
                                    transactionInfo?.extraItems.map((e, i) => 
                                        <p key={nanoid(16)}>
                                            {`[${i + 1}] ` + e}
                                        </p>
                                    )
                                }
                            </td>
                        </tr>
                        <tr>
                            <td>Attachments</td>
                            <td>{transactionInfo?.attachments || "-"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="transaction__table__wrapper">
                <h3>From Block</h3>
                <Table 
                    className="custom-scroll"
                    headers={[ "HASH", "HEIGHT", "TIMESTAMP (UTC)" ]}
                    elements={[[ 
                        <a 
                            className="table__hash" 
                            href={blockOrigin?.hash ? "/block/" + blockOrigin.hash : undefined}
                        >
                            {blockOrigin?.hash}
                        </a>,
                        blockOrigin?.height || "",
                        blockOrigin?.timestamp ? Utils.formatTimestampUTC(parseInt(blockOrigin.timestamp, 10)) : "" 
                    ]]}
                />
            </div>
            <div className="transaction__table__wrapper">
                <h3>Inputs ( 2 )</h3>
                <Table 
                    className="custom-scroll"
                    headers={[ "AMOUNT", "IMAGE / MULTISIG ID", "MIXIN COUNT", "GLOBAL INDEX" ]}
                    elements={[[ 
                        "1.00",
                        "a32ef806cc193cbe07e1cf7cff27e3a9609bae44e57e5999f46b69ffd9366a57",
                        "1",
                        <a className="table__hash" href="/block/1234">13496</a>,
                    ]]}
                />
            </div>
            <div className="transaction__table__wrapper">
                <h3>Outputs ( 2 )</h3>
                <Table 
                    className="custom-scroll"
                    headers={[ "AMOUNT", "KEY", "GLOBAL INDEX / MULTISIG ID" ]}
                    elements={[[ 
                        "1.00",
                        "048a327cb79739b33f6859b3a3082b6beafd380f1570b62e4598959442cd8641 [SPENT]",
                        "14124"
                    ]]}
                />
            </div>
        </div>
    )
}

export default Transaction;