import "../../styles/Transaction.scss";
import { useEffect, useState } from "react";
import Header from "../../components/default/Header/Header";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import StatsPanel from "../../components/default/StatsPanel/StatsPanel";
import Table from "../../components/default/Table/Table";
import TransactionInfo, { Input } from "../../interfaces/common/TransactionInfo";
import Fetch from "../../utils/methods";
import { useNavigate, useParams } from "react-router-dom";
import Utils from "../../utils/utils";
import { nanoid } from "nanoid";
import Popup from "../../components/default/Popup/Popup";
import { ReactComponent as CrossImg } from "../../assets/images/UI/cross.svg";
import Button from "../../components/UI/Button/Button";

interface Block {
    hash: string;
    height: string;
    timestamp: string;
}



function Transaction() {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [transactionInfo, setTransactionInfo] = useState<TransactionInfo | null>(null);
    const [blockOrigin, setBlockOrigin] = useState<Block | null>(null);

    const [popupState, setPopupState] = useState(false);
    const [selectedInput, setSelectedInput] = useState<Input | null>(null);

    const { hash } = useParams();

    const navigate = useNavigate();


    function convertENotationToNumber(num: number | string): string {
        const str = num.toString()
        const match = str.match(/^(\d+)(\.(\d+))?[eE]([-\+]?\d+)$/)
        if (!match) return str;
        const [, integer,, tail, exponentStr ] = match
        const exponent = Number(exponentStr)
        const realInteger = integer + (tail || '')
        if(exponent > 0) {
            const realExponent = Math.abs(exponent + integer.length)
            return realInteger.padEnd(realExponent, '0')
        } else {
            const realExponent = Math.abs(exponent - (tail?.length || 0))
            return '0.'+ realInteger.padStart(realExponent, '0')
        }
    }

    useEffect(() => {
        async function fetchTransaction() {
            if (!hash) return;
            const result = await Fetch.getTransaction(hash);
            if (result.success === false) return;
            if (!(typeof result === "object")) return;
            const newTransactionInfo: TransactionInfo = {
                hash: result.id || "",
                amount: Utils.toShiftedNumber(result.amount || "0", 12),
                fee: Utils.toShiftedNumber(result.fee || "0", 12),
                size: result.blob_size || "0",
                confirmations: parseInt(result.last_block, 10) - parseInt(result.keeper_block, 10),
                publicKey: result.pub_key || "-",
                mixin: "-",
                extraItems: [],
                ins: [],
                outs: [],
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

            try {
                const parsedIns = JSON.parse(result.ins);
                if (parsedIns instanceof Array) {
                    newTransactionInfo.ins = parsedIns.map(e => {
                        const mixins = (e?.mixins instanceof Array) ? e?.mixins : [];
                        const globalIndexes = (e?.global_indexes instanceof Array) ? e?.global_indexes : [];
                        return {
                            amount: e?.amount || 0,
                            keyimage: e?.kimage_or_ms_id || "",
                            mixins: mixins,
                            globalIndexes: globalIndexes
                        }
                    });
                }
            } catch {}

            try {
                const parsedOuts = JSON.parse(result.outs);
                if (parsedOuts instanceof Array) {
                    newTransactionInfo.outs = parsedOuts.map(e => {
                        const { pub_keys } = e;
                        const pubKeys = (pub_keys instanceof Array) ? pub_keys : [];

                        const existingAmount = (e?.amount / 1e12);
                        if (existingAmount) {
                            e.convertedAmount = convertENotationToNumber(existingAmount?.toExponential());
                        }

                        return {
                            amount: e.convertedAmount || "-",
                            publicKeys: pubKeys.slice(0, 4),
                            globalIndex: e?.global_index || 0
                        }
                    })
                }
            } catch {}

            setTransactionInfo(newTransactionInfo);
        }

        fetchTransaction();
    }, [hash]);

    function showIndexesClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, input: Input) {
        event.preventDefault();
        setSelectedInput(input);
        setPopupState(true);
    }

    async function onIndexClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, amount: number, index: number) {
        event.preventDefault();
        const result = await Fetch.getOutInfo(amount, index);
        if (result.tx_id && typeof result.tx_id === "string") {
            navigate("/transaction/" + result.tx_id);
            setPopupState(false);
        } 
    }

    const insRows = transactionInfo ? (
        transactionInfo.ins.map(e => [
            Utils.toShiftedNumber(e.amount, 12),
            e.keyimage,
            e.globalIndexes.length,
            e.globalIndexes.length > 1 ?
            (
                <a href="/" onClick={event => showIndexesClick(event, e)}>Show all...</a>
            )
            : 
            (
                <a 
                    href="/" 
                    onClick={event => onIndexClick(event, e.amount, e.globalIndexes[0])}
                >
                    {e.globalIndexes[0] ?? ""}
                </a>
            )
        ])
    ) : [];

    const outsRows = transactionInfo ? (
        transactionInfo.outs.map(e => [
            e.amount,
            <div className="transaction__outs__keys">
                {e.publicKeys.map(e => <p>{e}</p>)}
            </div>,
            e.globalIndex
        ])
    ) : [];

    function GlobalIndexesPopup({ close }: { close: () => void; }) {
        const popupIndexes = selectedInput?.globalIndexes || [];
        const amount = selectedInput?.amount || 0;

        return (
            <div className="transaction__indexes__popup">
                <h3>
                    Input ring set ({popupIndexes.length})
                </h3>
                <div>
                    {popupIndexes.map(e => 
                        (
                            <a 
                                href="/" 
                                key={e}
                                onClick={event => onIndexClick(event, amount, e)}
                            >
                                {e}
                            </a>
                        )
                    )}
                </div>
                <Button 
                    wrapper 
                    className="popup__cross"
                    onClick={close}
                >
                    <CrossImg />
                </Button>
            </div>
        )
    }

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
            <StatsPanel noStats={true}/>
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
                    columnsWidth={[ 65, 15, 20 ]}
                />
            </div>
            <div className="transaction__table__wrapper">
                <h3>{`Inputs ( ${insRows.length} )`}</h3>
                <Table 
                    className="transaction__table__inputs custom-scroll"
                    headers={[ "AMOUNT", "IMAGE / MULTISIG ID", "DECOY COUNT", "GLOBAL INDEX" ]}
                    elements={insRows}
                    columnsWidth={[ 15, 50, 15, 20 ]}
                />
            </div>
            <div className="transaction__table__wrapper">
                <h3>{`Outputs ( ${outsRows.length} )`}</h3>
                <Table 
                    className="custom-scroll"
                    headers={[ "AMOUNT", "KEY", "GLOBAL INDEX / MULTISIG ID" ]}
                    elements={outsRows}
                    columnsWidth={[ 15, 65, 20 ]}
                    textWrap
                />
            </div>
            {popupState &&
                <Popup 
                    Content={GlobalIndexesPopup}
                    settings={{}}
                    close={() => setPopupState(false)}
                    blur
                />
            }
        </div>
    )
}

export default Transaction;