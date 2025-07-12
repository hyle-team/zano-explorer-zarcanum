import { chartRequestNames } from './constants';

const PORT = process.env.SERVER_PORT;

function postFetch(path: string, body: object) {
	return fetch(path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
}

class Fetch {
	static readonly proxyPath =
		typeof window === 'undefined' ? `http://localhost:${PORT}/api` : '/api';

	static getInfo() {
		return fetch(`${this.proxyPath}/get_info`).then((res) => res.json());
	}

	static getExplorerStatus() {
		return fetch(`${this.proxyPath}/explorer_status`).then((res) => res.json());
	}

	static getBlockDetails(page: number, blocksAmount: number) {
		return fetch(`${this.proxyPath}/get_blocks_details/${page}/${blocksAmount}`).then((res) =>
			res.json(),
		);
	}

	static getVisibilityInfo() {
		return fetch(`${this.proxyPath}/get_visibility_info`).then((res) => res.json());
	}

	static getAltBlocksInfo(offset: number, amount: number) {
		return fetch(`${this.proxyPath}/get_alt_blocks_details/${offset}/${amount}`).then((res) =>
			res.json(),
		);
	}

	static getAliases(offset: number, amount: number, premiumOnly: boolean, search?: string) {
		return fetch(
			`${
				this.proxyPath
			}/get_aliases/${offset}/${amount}/${search || 'all'}/${premiumOnly ? 'premium' : 'all'}`,
		).then((res) => res.json());
	}

	static getBlockInfo(hash: string, alt: boolean = false) {
		return fetch(
			`${this.proxyPath}/${alt ? 'get_alt_block_details' : 'get_main_block_details'}/${hash}`,
		).then((res) => res.json());
	}

	static async getHashByHeight(height: number): Promise<string | null> {
		if (height === -1) return '';

		const result = await this.getBlockDetails(height, 1);
		if (result.success === false) return null;
		if (!(result instanceof Array)) return null;

		const hash = result[0]?.tx_id;

		if (typeof hash !== 'string') return '';

		return hash;
	}

	static getTransaction(hash: string) {
		return fetch(`${this.proxyPath}/get_tx_details/${hash}`).then((res) => res.json());
	}

	static searchById(id: string) {
		return fetch(`${this.proxyPath}/search_by_id/${id}`).then((res) => res.json());
	}

	static getChartData(chartId: string, offset: number) {
		const chartRequestName = chartRequestNames[chartId];
		if (!chartRequestName) return undefined;
		return fetch(`${this.proxyPath}/get_chart/${chartRequestName}/${offset}`).then((res) =>
			res.json(),
		);
	}

	static getWhitelistedAssets(offset: number, count: number, searchText: string) {
		return fetch(
			`${this.proxyPath}/get_whitelisted_assets/${offset}/${count}?search=${searchText}`,
		).then((res) => res.json());
	}

	static getAssets(offset: number, count: number, searchText: string) {
		return fetch(`${this.proxyPath}/get_assets/${offset}/${count}?search=${searchText}`).then(
			(res) => res.json(),
		);
	}

	static getOutInfo(amount: number, index: number) {
		return fetch(`${this.proxyPath}/get_out_info/${amount}/${index}`).then((res) => res.json());
	}

	static getTxByKeyimage(image: string) {
		return fetch(`${this.proxyPath}/get_tx_by_keyimage/${image}`).then((res) => res.json());
	}

	static getPrice() {
		return fetch(`${this.proxyPath}/price`).then((res) => res.json());
	}

	static getAssetDetails(assetId: string) {
		return fetch(`${this.proxyPath}/get_asset_details/${assetId}/`).then((res) => res.json());
	}

	static getAssetsCount() {
		return fetch(`${this.proxyPath}/get_assets_count`).then((res) => res.json());
	}

	static getAliasesCount() {
		return fetch(`${this.proxyPath}/get_aliases_count`).then((res) => res.json());
	}

	static getTxPoolInfo(count: number) {
		return fetch(`${this.proxyPath}/get_tx_pool_details/${encodeURIComponent(count)}`).then(
			(res) => res.json(),
		);
	}

	static getAssetsPriceRates(assetsIds: string[]) {
		return postFetch(`${this.proxyPath}/get_assets_price_rates`, { assetsIds }).then((res) =>
			res.json(),
		);
	}

	static getMatrixAddresses(page: string, items: string) {
		return fetch(`${this.proxyPath}/get_matrix_addresses/?page=${page}&items=${items}`).then(
			(res) => res.json(),
		);
	}
}

export default Fetch;
