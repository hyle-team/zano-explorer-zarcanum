import { chartRequestNames } from "./constants";

async function postFetch(path: string, body: Object) {
    return await fetch("/api/user/set-theme", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }).then(res => res.json());
}

class Fetch {
    static readonly proxyPath = "/api";

    static async getInfo() {
        return await fetch(this.proxyPath + "/get_info").then(res => res.json());
    }

    static async getBlockDetails(page: number, blocksAmount: number) {
        return await fetch(this.proxyPath + `/get_blocks_details/${page}/${blocksAmount}`).then(res => res.json());
    }

    static async getVisibilityInfo() {
        return await fetch(this.proxyPath + `/get_visibility_info`).then(res => res.json());
    }

    static async getAltBlocksInfo(offset: number, amount: number) {
        return await fetch(this.proxyPath + `/get_alt_blocks_details/${offset}/${amount}`).then(res => res.json());
    }

    static async getAliases(offset: number, amount: number, search?: string) {
        return await fetch(this.proxyPath + `/get_aliases/${offset}/${amount}/${search || "all"}`).then(res => res.json());
    }

    static async getBlockInfo(hash: string, alt: boolean = false) {
        return await fetch(this.proxyPath + `/${alt ? "get_alt_block_details" : "get_main_block_details"}/${hash}`).then(res => res.json());
    }

    static async getHashByHeight(height: number): Promise<string | null> {
        const result = await this.getBlockDetails(height, 1);
        if (result.success === false) return null;
        if (!(result instanceof Array)) return null;

        const hash = result[0]?.id;

        if (typeof hash !== "string") return "";

        return hash;
    }

    static async getTransaction(hash: string) {
        return await fetch(this.proxyPath + `/get_tx_details/${hash}`).then(res => res.json());
    }

    static async searchById(id: string) {
        return await fetch(this.proxyPath + `/search_by_id/${id}`).then(res => res.json());
    }

    static async getChartData(chartId: string) {
        const chartRequestName = chartRequestNames[chartId];
        if (!chartRequestName) return undefined;
        return await fetch(this.proxyPath + `/get_chart/${chartRequestName}/all`).then(res => res.json());
    }

    static async getWhitelistedAssets(offset: number, count: number, searchText: string) {
        return await fetch(this.proxyPath + `/get_whitelisted_assets/${offset}/${count}?search=${searchText}`).then(res => res.json());
    }

    static async getAssets(offset: number, count: number, searchText: string) {
        return await fetch(this.proxyPath + `/get_assets/${offset}/${count}?search=${searchText}`).then(res => res.json());
    }

    static async getOutInfo(amount: number, index: number) {
        return await fetch(this.proxyPath + "/get_out_info/" + amount + "/" + index).then(res => res.json());
    }

    static async getTxByKeyimage(image: string) {
        return await fetch(this.proxyPath + "/get_tx_by_keyimage/" + image).then(res => res.json());
    }

    static async getPrice() {
        return await fetch(this.proxyPath + "/price").then(res => res.json());
    }

    static async getAssetDetails(assetId: string) {
        return await fetch(this.proxyPath + "/get_asset_details/" + assetId + "/").then(res => res.json());
    }
}

export default Fetch;