interface Input {
    amount: number;
    keyimage: string;
    mixins: any[];
    globalIndexes: number[];
}

interface Output {
    amount: number;
    publicKey: string;
    globalIndex: string;
}

interface TransactionInfo {
    hash: string;
    amount: string;
    fee: string;
    size: string;
    confirmations: string;
    publicKey: string;
    mixin?: string;
    extraItems: string[];
    attachments?: string;
    ins: Input[];
    outs: Output[];
}

export default TransactionInfo;

export { Input, Output };