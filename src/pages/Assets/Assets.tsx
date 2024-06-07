import "../../styles/Assets.scss";
import { useState, useEffect } from "react";
import Header from "../../components/default/Header/Header";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import Table from "../../components/default/Table/Table";
import Fetch from "../../utils/methods";
import AliasText from "../../components/default/AliasText/AliasText";
import JSONPopup from "../../components/default/JSONPopup/JSONPopup";
import Switch from "../../components/UI/Switch/Switch";

function Assets() {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [assets, setAssets] = useState<any[]>([]);

    const [assetJson, setAssetJson] = useState<Object>({});

    const [popupState, setPopupState] = useState(false);

    const [itemsOnPage, setItemsOnPage] = useState("10");
    const [page, setPage] = useState("1");

    const [isWhitelist, setIsWhitelist] = useState(true);

    useEffect(() => {
        setPage("1");
    }, [isWhitelist]);

    useEffect(() => {
        async function fetchAssets() {
            const itemsOnPageInt = parseInt(itemsOnPage, 10) || 0;
            const pageInt = parseInt(page, 10) || 0;

            const offset = (pageInt - 1) * itemsOnPageInt;

            const result = isWhitelist 
                ? await Fetch.getWhitelistedAssets(offset, itemsOnPageInt)  
                : await Fetch.getAssets(offset, itemsOnPageInt)

            const resultAssets = result?.assets;
            if (!resultAssets || !(resultAssets instanceof Array)) return;
            setAssets(resultAssets);
        }
        
        fetchAssets();
    }, [itemsOnPage, page, isWhitelist]);

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
                content={
                    <Switch
                        firstTitle="Whitelisted"
                        secondTitle="All Assets"
                        isFirstSelected={isWhitelist}
                        setIsFirstSelected={setIsWhitelist}
                    />
                }
            />
            <div className="assets__table">
                <Table 
                    headers={tableHeaders}
                    elements={tableElements}
                    columnsWidth={[ 15, 10, 65, 10 ]}
                    pagination
                    hidePaginationBlock
                    itemsOnPage={itemsOnPage}
                    setItemsOnPage={setItemsOnPage}
                    page={page}
                    setPage={setPage}
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