import "../../styles/Aliases.scss";
import { useState, useEffect } from "react";
import Header from "../../components/default/Header/Header";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import Table from "../../components/default/Table/Table";
import Alias from "../../interfaces/state/Alias";
import Fetch from "../../utils/methods";

function Aliases() {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [aliases, setAliases] = useState<Alias[]>([]);

    const [itemsOnPage, setItemsOnPage] = useState("10");
    const [page, setPage] = useState("1");

    useEffect(() => {
        async function fetchAliases() {
            const currentPage = parseInt(page, 10) || 0;
            const itemsAmount = parseInt(itemsOnPage, 10) || 0;
            const result = await Fetch.getAliases((currentPage - 1) * itemsAmount, itemsAmount);

            if (result.sucess === false) return;
            if (!(result instanceof Array)) return;
            setAliases(
                result.map((e: any) => ({
                    alias: e.alias || "",
                    address: e.address || ""
                }))
            );
        }

        fetchAliases();

        const id = setInterval(fetchAliases, 20 * 1e3);

        return () => clearInterval(id);
    }, [itemsOnPage, page]);

    const tableHeaders = [ "NAME", "ADDRESS" ];

    const tableElements = aliases.map(e => [
        e.alias,
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