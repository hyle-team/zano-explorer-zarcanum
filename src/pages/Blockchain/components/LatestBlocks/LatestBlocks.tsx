import AliasText from "@/components/default/AliasText/AliasText";
import Table from "@/components/default/Table/Table";
import Block from "@/interfaces/state/Block";
import Info from "@/interfaces/state/Info";
import Fetch from "@/utils/methods";
import Utils from "@/utils/utils";
import styles from "./LatestBlocks.module.scss";
import { useState, useEffect } from "react";
import Link from "next/link";

function LatestBlocks() {

    const [info, setInfo] = useState<Info | null>(null);

    useEffect(() => {
        async function fetchInfo() {
            const result = await Fetch.getInfo();
            if (result.success === false) return;
            if (!result.height) return;
            setInfo(result);
        }

        fetchInfo();

        const interval = setInterval(fetchInfo, 20 * 1e3);

        return () => clearInterval(interval);
    }, []);


    const [blocks, setBlocks] = useState<Block[]>([]);

    const [itemsOnPage, setItemsOnPage] = useState("10");
    const [pagesAmount, setPagesAmount] = useState(0);
    const [page, setPage] = useState("1");
    const [goToBlock, setGoToBlock] = useState("");

    useEffect(() => {
        if (!info) return;
        const { height } = info;
        const itemsParsed = parseInt(itemsOnPage || "0", 10);

        function onGoToBlockEnter() {
            if (!goToBlock || !itemsOnPage) return;
            const goToHeight = parseInt(goToBlock || "0", 10);
            if (goToHeight > height - 1) return;
            const offset = height - goToHeight;
            const newPage = Math.ceil(offset / itemsParsed);
            setPage(newPage.toString());
        }

        setPagesAmount(Math.ceil((height - 1) / itemsParsed));

        onGoToBlockEnter();
    }, [goToBlock, info, itemsOnPage]);
    

    useEffect(() => {
        async function fetchBlocks() {
            const items = parseInt(itemsOnPage, 10) || 0;
            const pageNumber = parseInt(page, 10) || 0;
            if (pageNumber === 0) return;
            if (!info) return;
            const { height } = info;
            const result = await Fetch.getBlockDetails(height - items * pageNumber, items);
            if (result.sucess === false) return;
            if (!(result instanceof Array)) return;
            setBlocks(
                Utils.transformToBlocks(result, true)
            );
        }
        
        fetchBlocks();
        const id = setInterval(fetchBlocks, 20 * 1e3);
        return () => clearInterval(id);
    }, [info, itemsOnPage, page]);

    const tableHeaders = [ "HEIGHT", "TIMESTAMP (UTC)", "AGE", "SIZE", "TRANSACTIONS", "HASH" ];

    const tableElements = blocks.map(e => {
        const hash = e.hash;
        const hashLink = hash ? "/block/" + hash : "/";
        return [
            <p>
                <Link href={hashLink}>{e.height}</Link>
                {` (${e.type})`}
            </p>,
            Utils.formatTimestampUTC(e.timestamp),
            Utils.timeElapsedString(e.timestamp),
            `${e.size} bytes`,
            e.transactions?.toString() || "0",
            <AliasText href={hashLink}>{hash}</AliasText>
        ]
    });

    return (
        <div className={styles["blockchain__latest_blocks"] + " " + styles["custom-scroll"]}>
            <h3>Latest Blocks</h3>
            <Table 
                pagination
                headers={tableHeaders} 
                elements={tableElements} 
                itemsOnPage={itemsOnPage}
                setItemsOnPage={setItemsOnPage}
                page={page}
                setPage={setPage}
                goToBlock={goToBlock}
                setGoToBlock={setGoToBlock}
                pagesTotal={pagesAmount}
                // goToBlockEnter={onGoToBlockEnter}
            />
        </div>
    )
}

export default LatestBlocks;