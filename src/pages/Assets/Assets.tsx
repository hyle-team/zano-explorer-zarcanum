import "../../styles/Assets.scss";
import { useState, useEffect } from "react";
import Header from "../../components/default/Header/Header";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import Table from "../../components/default/Table/Table";
import Fetch from "../../utils/methods";
import AliasText from "../../components/default/AliasText/AliasText";
import JSONPopup from "../../components/default/JSONPopup/JSONPopup";

function Assets() {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [assets, setAssets] = useState<any[]>([]);

    const [assetJson, setAssetJson] = useState<Object>({});

    const [popupState, setPopupState] = useState(false);

    useEffect(() => {
        async function fetchAssets() {
            const result = await Fetch.getAssets();
            const resultAssets = result?.assets;
            if (!resultAssets || !(resultAssets instanceof Array)) return;
            setAssets(resultAssets);
        }
        
        fetchAssets();
    }, []);

    function onAssetClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, asset: Object) {
        event.preventDefault();
        setAssetJson(asset);
        setPopupState(true);
    }

    const tableHeaders = [ "NAME", "TICKER", "ASSET ID", "PRICE (POWERED BY COINGECKO)" ];

    const tableElements = assets.map(e => [
        e?.full_name || "",
        e?.ticker || "",
        <AliasText href="/" onClick={(event) => onAssetClick(event, e)}>
            {e?.asset_id || ""}
        </AliasText>,
        e?.price ? `${e?.price}$` : "No data"
    ]);

    return (
        <div className="assets">
            <Header 
                page="Assets" 
                burgerOpened={burgerOpened} 
                setBurgerOpened={setBurgerOpened} 
            />
            <InfoTopPanel 
                burgerOpened={burgerOpened} 
                title="Assets"
            />
            <div className="assets__table">
                <Table 
                    headers={tableHeaders}
                    elements={tableElements}
                    columnsWidth={[ 15, 10, 65, 10 ]}
                />
            </div>
            <JSONPopup 
                popupState={popupState}
                setPopupState={setPopupState}
                json={assetJson}
            />
        </div>
    )
}

export default Assets;