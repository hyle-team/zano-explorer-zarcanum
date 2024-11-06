import styles from "@/styles/Aliases.module.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import Header from "../../components/default/Header/Header";
import InfoTopPanel from "../../components/default/InfoTopPanel/InfoTopPanel";
import Table from "../../components/default/Table/Table";
import Alias from "../../interfaces/state/Alias";
import Fetch from "../../utils/methods";
import CrownImg from "../../assets/images/UI/crown.svg";
import CommonStatsPanel from "../../components/UI/CommonStatsPanel/CommonStatsPanel";
import { GetServerSideProps } from "next";
import { AliasesPageProps, getAliases } from "@/utils/ssr";
import Switch from "@/components/UI/Switch/Switch";
import { nanoid } from "nanoid";

export const DEFAULT_ITEMS_ON_PAGE = "20";

function Aliases(props: AliasesPageProps) {
    const [burgerOpened, setBurgerOpened] = useState(false);

    const [aliases, setAliases] = useState<Alias[]>(props.aliases);

    const [itemsOnPage, setItemsOnPage] = useState(DEFAULT_ITEMS_ON_PAGE);
    const [page, setPage] = useState("1");
    const [searchState, setSearchState] = useState("");
    const [aliasStats, setAliasStats] = useState<{
        aliasesAmount?: number;
        premiumAliasesAmount?: number;
    }>({
        aliasesAmount: props.aliasesAmount,
        premiumAliasesAmount: props.premiumAliasesAmount
    });
    const [isPremiumOnly, setIsPremiumOnly] = useState(false);

    const fetchIdRef = useRef<string>(nanoid());

    const fetchAliases = useCallback(async () => {
        const currentPage = parseInt(page, 10) || 0;
        const itemsAmount = parseInt(itemsOnPage, 10) || 0;

        const newFetchId = nanoid();
        fetchIdRef.current = newFetchId;

        const result = await Fetch.getAliases(
            (currentPage - 1) * itemsAmount,
            itemsAmount,
            isPremiumOnly,
            searchState || undefined,
        );

        if (newFetchId !== fetchIdRef.current) return;

        if (result.sucess === false) return;
        if (!(result instanceof Array)) return;
        setAliases(
            result.map((e: any) => ({
                alias: e.alias || "",
                address: e.address || ""
            }))
        );
    }, [itemsOnPage, page, searchState, isPremiumOnly]);

    useEffect(() => {
        setPage("1");
    }, [isPremiumOnly, searchState]);

    useEffect(() => {
        fetchAliases();

        const id = setInterval(fetchAliases, 20 * 1e3);

        return () => clearInterval(id);
    }, [fetchAliases]);

    useEffect(() => {
        async function fetchAliasesCount() {
            const result = await Fetch.getAliasesCount();
            const aliasesAmount = result?.aliasesAmount;
            const premiumAliasesAmount = result?.premiumAliasesAmount;
            setAliasStats({
                aliasesAmount: typeof aliasesAmount === "number" ? aliasesAmount : undefined,
                premiumAliasesAmount: typeof premiumAliasesAmount === "number" ? premiumAliasesAmount : undefined
            });
        }
        
        fetchAliasesCount();
    }, []);

    const tableHeaders = [ "NAME", "ADDRESS" ];

    function ShortAlias({ alias }: { alias: string }) {
        return (
            <div>
                <div className={styles["short_alias"]}>
                    {alias}
                    <div className={styles["short_alias__crown"]}>
                        <CrownImg />
                    </div>
                </div>
            </div>
        );
    }

    const tableElements = aliases.map(e => [
        e.alias.length > 5 ? e.alias : <ShortAlias alias={e.alias} />,
        e.address
    ]);

    const statsPanelData = [
        { key: "Total Aliases", value: aliasStats.aliasesAmount?.toString() || "..." },
        { key: "Premium", value: aliasStats.premiumAliasesAmount?.toString() || "..." }
    ];

    return (
        <div className={styles["aliases"]}>
            <Header 
                page="Aliases" 
                burgerOpened={burgerOpened} 
                setBurgerOpened={setBurgerOpened} 
            />
            <InfoTopPanel 
                burgerOpened={burgerOpened} 
                title="Aliases" 
                contentNotHiding
                inputDefaultClosed
                inputParams={{ 
                    placeholder: "name / address / comment",
                    state: searchState,
                    setState: setSearchState
                }}
                content={
                    <Switch
                        firstTitle="Premium"
                        secondTitle="All Aliases"
                        isFirstSelected={isPremiumOnly}
                        setIsFirstSelected={setIsPremiumOnly}
                    />
                }
            />
            <CommonStatsPanel pairs={statsPanelData} className={styles["aliases__stats"]} />
            <div className={`${styles["aliases__table"]} custom-scroll`}>
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

const getServerSideProps: GetServerSideProps = getAliases;
export { getServerSideProps };

export default Aliases;