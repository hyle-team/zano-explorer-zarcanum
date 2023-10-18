interface Block {
    height: number;
    type: "PoS" | "PoW",
    timestamp: number;
    size: number;
    transactions: number;
    hash: string;
}

export default Block;