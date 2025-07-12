interface TransactionDetail {
	id: string;
}
interface TrOut {
	amount: string | number;
	i: number;
}

interface IBlock {
	height: number;
	actual_timestamp: number;
	block_cumulative_size: number;
	cumulative_diff_precise: number;
	difficulty: number;
	tr_count?: number;
	tr_out?: TrOut[];
	type: string;
	base_reward: string;
	blob: string;
	block_tself_size: number;
	cumulative_diff_adjusted: number;
	effective_fee_median: number;
	id: string;
	is_orphan: boolean;
	penalty: number;
	prev_id: string;
	summary_reward: string;
	this_block_fee_median: number;
	timestamp: number;
	total_fee: string;
	total_txs_size: number;
	miner_text_info: string;
	already_generated_coins: string;
	object_in_json: string;
	pow_seed: string;
	transactions_details: TransactionDetail[];
}

export default IBlock;
