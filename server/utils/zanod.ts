import axios from 'axios';
import Pool from 'server/schemes/Pool';
import { config } from './utils';

export async function get_info() {
	return axios({
		method: 'get',
		url: config.api,
		data: {
			method: 'getinfo',
			params: { flags: 0x410 },
		},
		transformResponse: [(data) => JSON.parse(data)],
	});
}

export function get_blocks_details(start: number, count: number) {
	return axios({
		method: 'get',
		url: config.api,
		data: {
			method: 'get_blocks_details',
			params: {
				height_start: parseInt(String(start || 0)),
				count: parseInt(String(count || 10)),
				ignore_transactions: false,
			},
		},
		transformResponse: [(data) => JSON.parse(data)],
	});
}

export function get_alt_blocks_details(offset: number, count: number | undefined) {
	return axios({
		method: 'get',
		url: config.api,
		data: {
			method: 'get_alt_blocks_details',
			params: {
				offset: parseInt(String(offset)),
				count: parseInt(String(count)),
			},
		},
		transformResponse: [(data) => JSON.parse(data)],
	});
}

export function get_all_pool_tx_list() {
	return axios({
		method: 'get',
		url: config.api,
		data: {
			method: 'get_all_pool_tx_list',
		},
		transformResponse: [(data) => JSON.parse(data)],
	});
}

export function get_pool_txs_details(ids: Pool[]) {
	return axios({
		method: 'get',
		url: config.api,
		data: {
			method: 'get_pool_txs_details',
			params: { ids },
		},
		transformResponse: [(data) => JSON.parse(data)],
	});
}

export function get_tx_details(tx_hash: string) {
	return axios({
		method: 'get',
		url: config.api,
		data: {
			method: 'get_tx_details',
			params: { tx_hash },
		},
		transformResponse: [(data) => JSON.parse(data)],
	});
}

export function get_out_info(amount: string, i: number) {
	return axios({
		method: 'get',
		url: config.api,
		data: {
			method: 'get_out_info',
			params: { amount: parseInt(amount), i: parseInt(String(i)) },
		},
		transformResponse: [(data) => JSON.parse(data)],
	});
}

export function getbalance() {
	return axios({
		method: 'post',
		url: config.auditable_wallet.api,
		data: {
			method: 'getbalance',
			params: {},
		},
		transformResponse: [(data) => JSON.parse(data)],
	});
}

export function get_mining_history(howManyDays = 7) {
	const now = new Date();
	const date = now.getDate() - howManyDays;
	const timestamp = Math.round(now.setDate(date) / 1000);

	console.log('Mining history timestamp:', timestamp);

	return axios({
		method: 'post',
		url: config.auditable_wallet.api,
		data: {
			method: 'get_mining_history',
			params: { v: timestamp },
		},
		transformResponse: [(data) => JSON.parse(data)],
	});
}
