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
    static async getInfo() {
        return await fetch("/proxy/get_info").then(res => res.json());
    }

    static async getBlockDetails(page: number, blocksAmount: number) {
        return await fetch(`/proxy/get_blocks_details/${page}/${blocksAmount}`).then(res => res.json());
    }

    static async getVisibilityInfo() {
        return await fetch(`/proxy/get_visibility_info`).then(res => res.json());
    }

    static async getAltBlocksInfo(offset: number, amount: number) {
        return await fetch(`/proxy/get_alt_blocks_details/${offset}/${amount}`).then(res => res.json());
    }

    static async getAliases(offset: number, amount: number) {
        return await fetch(`/proxy/get_aliases/${offset}/${amount}/all`).then(res => res.json());
    }

    static async getBlockInfo(hash: string, alt: boolean = false) {
        return await fetch(`/proxy/${alt ? "get_alt_block_details" : "get_main_block_details"}/${hash}`).then(res => res.json());
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
        return await fetch(`/proxy/get_tx_details/${hash}`).then(res => res.json());
    }

    static async searchById(id: string) {
        return await fetch(`/proxy/search_by_id/${id}`).then(res => res.json());
    }
}

export default Fetch;