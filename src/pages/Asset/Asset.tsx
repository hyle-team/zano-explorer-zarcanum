import "../../styles/Asset.scss";
import { useState } from "react";
import Header from "../../components/default/Header/Header";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import Table from "../../components/default/Table/Table";

export default function Asset() {
    const [burgerOpened, setBurgerOpened] = useState(false);
    
    const assetsRows = [
        ["Ticker", "ZANO"],
        ["Name", "ZANO"],
        ["Description", "ZANO"],
        ["Decimal Point", "12"],
        ["Total Supply", "100000000000"],
        ["Max Supply", "100000000000"],
    ]

    return (
        <div>
            <Header
                page="Assets" 
                burgerOpened={burgerOpened} 
                setBurgerOpened={setBurgerOpened} 
            />
            <InfoTopPanel
                burgerOpened={burgerOpened} 
                title=""
                back
                className="block__info__top"
            />
            <Table 
                columnsWidth={[50, 50]}
                headers={["NAME", "AMOUNT"]}
                elements={assetsRows}
                className="asset__table"
            />
        </div>
    )
}