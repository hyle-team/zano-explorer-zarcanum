interface BlockInfo {
	type: 'PoS' | 'PoW';
	timestamp?: string;
	actualTimestamp?: string;
	difficulty: string;
	minerTextInfo?: string;
	cummulativeDiffAdjusted?: string;
	cummulativeDiffPresize?: string;
	orphan?: boolean;
	baseReward: string;
	transactionsFee: string;
	rewardPenalty: string;
	reward: string;
	totalBlockSize?: string;
	effectiveTxsMedian?: number;
	blockFeeMedian?: string;
	effectiveFeeMedian?: string;
	currentTxsMedian?: number;
	transactions: string;
	transactionsSize?: string;
	seed?: string;
	alreadyGeneratedCoins?: string;
	object_in_json?: string;
	tx_id?: string;
	prev_id?: string;
	major_version?: string;
	minor_version?: string;
}

export interface BlockApiItem {
	height: number;
	type: string;
	timestamp: string;
	total_txs_size: number;
	tr_count: number;
	tx_id?: string;
	hash?: string;
}

export default BlockInfo;
