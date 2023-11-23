import "./Table.scss";
import { ReactComponent as ArrowImg } from "../../../assets/images/UI/arrow.svg";
import { nanoid } from "nanoid";
import Input from "../../UI/Input/Input";
import TableProps from "./Table.props";

function Table(props: TableProps) { 
    function onNumberInput(event: React.FormEvent<HTMLInputElement>, setState?: React.Dispatch<React.SetStateAction<string>>, max?: number) {
        if (!setState) return;
        const newValue = event.currentTarget.value;
        if (newValue !== "" && !newValue.match(/^\d+$/)) return event.preventDefault();
        if (max) {
            const number = parseInt(newValue, 10) || 0;
            if (number > max) return setState(max.toString());
        }
        setState(newValue);
    }

    const { 
        headers, 
        elements, 
        pagination, 
        className, 
        hidePaginationBlock, 
        itemsOnPage, 
        setItemsOnPage, 
        page, 
        setPage,
        goToBlock,
        setGoToBlock,
        goToBlockEnter,
        columnsWidth,
        textWrap,
        pagesTotal
    } = props;

    function changePage(increase: number) {
        if (!page || !setPage) return;
        const pageNumber = parseInt(page, 10);
        setPage(Math.max(1, pageNumber + increase).toString());
    }

    return (
        <div className={className}>
            <table className={"table " + (!textWrap ? "table__text_nowrap" : "")}>
                <thead>
                    <tr>
                        {
                            headers.map(e => <th key={nanoid(16)}>{e}</th>)
                        }
                    </tr>
                </thead>
                <tbody>
                    {elements.map(row => 
                        <tr key={nanoid(16)}>
                            {
                                row.map((e, i) => 
                                    <td 
                                        style={columnsWidth ? { width: `${columnsWidth[i]}%` } : undefined} 
                                        key={nanoid(16)}
                                    >
                                        {e}
                                    </td>
                                )
                            }
                        </tr>
                    )}
                    
                </tbody>
            </table>
            {pagination && 
                <div className="table__pagination">
                    <div className="table__pagination__pages">
                        <p>Pages: </p>
                        <div>
                            <button 
                                className={page === "1" ? "disabled" : undefined}
                                onClick={() => changePage(-1)}
                            >
                                <ArrowImg />
                            </button>
                            <button
                                onClick={() => changePage(1)}
                            >
                                <ArrowImg />
                            </button>
                        </div>
                        <Input 
                            type="text"
                            value={page}
                            onInput={(e) => onNumberInput(e, setPage)}
                        />
                    </div>
                    {pagesTotal && <p>Pages total: {pagesTotal}</p>}
                    <div className="table__pagination__blocks">
                        <div>
                            <p>Items on page: </p>
                            <Input 
                                type="text" 
                                value={itemsOnPage} 
                                onInput={(e) => onNumberInput(e, setItemsOnPage, 50)} 
                            />
                        </div>
                        {!hidePaginationBlock &&
                            <div>
                                <p>Go to block: </p>
                                <Input
                                    type="text" 
                                    placeholder="number" 
                                    value={goToBlock} 
                                    onInput={(e) => onNumberInput(e, setGoToBlock)} 
                                    onEnterPress={goToBlockEnter}
                                />
                            </div>
                        }
                    </div>
                </div>
            }
           
        </div>
    )
}

export default Table;