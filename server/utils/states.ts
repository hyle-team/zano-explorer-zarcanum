
interface IBlockInfo {
    lastBlock?: number,
    daemon_network_state?: number,
    height?: number,
    tx_pool_size?: number,
    alias_count?: number,
    alt_blocks_count?: number,
}
export const blockInfo: IBlockInfo = {};


export interface ILastBlock {
    height: number,
    id: string
}
export let lastBlock: ILastBlock = {
    height: -1,
    id: '0000000000000000000000000000000000000000000000000000000000000000'
}