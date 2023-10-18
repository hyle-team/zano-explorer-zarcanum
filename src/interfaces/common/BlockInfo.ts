interface BlockInfo {
    type: "PoS" | "PoW";
    timestamp?: number;
    actualTimestamp?: number;
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
}

export default BlockInfo;