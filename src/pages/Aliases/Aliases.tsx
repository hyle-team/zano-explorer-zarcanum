import "../../styles/Aliases.scss";
import { useState, useEffect, useCallback } from "react";
import Header from "../../components/default/Header/Header";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import Table from "../../components/default/Table/Table";
import Alias from "../../interfaces/state/Alias";
import Fetch from "../../utils/methods";
import crownImg from "../../assets/images/UI/crown.svg";

function Aliases() {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [aliases, setAliases] = useState<Alias[]>([]);

    const [itemsOnPage, setItemsOnPage] = useState("20");
    const [page, setPage] = useState("1");

    const [searchState, setSearchState] = useState("");

    const fetchAliases = useCallback(async () => {
        const currentPage = parseInt(page, 10) || 0;
        const itemsAmount = parseInt(itemsOnPage, 10) || 0;
        const result = await Fetch.getAliases((currentPage - 1) * itemsAmount, itemsAmount, searchState || undefined);

        if (result.sucess === false) return;
        if (!(result instanceof Array)) return;
        setAliases(
            result.map((e: any) => ({
                alias: e.alias || "",
                address: e.address || ""
            }))
        );
    }, [itemsOnPage, page, searchState]);

    useEffect(() => {
        fetchAliases();

        const id = setInterval(fetchAliases, 20 * 1e3);

        return () => clearInterval(id);
    }, [fetchAliases]);

    const tableHeaders = [ "NAME", "ADDRESS" ];

    function ShortAlias({ alias }: { alias: string }) {
        return (
            <div>
                <div className="short_alias">
                    {alias}
                    <div className="short_alias__crown">
                        <img src={crownImg} alt="" />
                    </div>
                </div>
            </div>
        );
    }

    const tableElements = aliases.map(e => [
        e.alias.length > 5 ? e.alias : <ShortAlias alias={e.alias} />,
        e.address
    ]);

    return (
        <div className="aliases">
            <Header 
                page="Aliases" 
                burgerOpened={burgerOpened} 
                setBurgerOpened={setBurgerOpened} 
            />
            <InfoTopPanel 
                burgerOpened={burgerOpened} 
                title="Aliases" 
                inputParams={{ 
                    placeholder: "name / address / comment",
                    state: searchState,
                    setState: setSearchState
                }}
            />
            <div className="aliases__table custom-scroll">
                <Table 
                    headers={tableHeaders}
                    elements={tableElements}
                    pagination
                    hidePaginationBlock
                    itemsOnPage={itemsOnPage}
                    setItemsOnPage={setItemsOnPage}
                    page={page}
                    setPage={setPage}
                />
            </div>
        </div>
    )
}

export default Aliases;