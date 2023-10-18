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
}

export default TransactionInfo;