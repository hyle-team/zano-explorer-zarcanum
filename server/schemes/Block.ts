import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

class Block extends Model {
    declare readonly id: number;
    declare height: number;
    declare actual_timestamp: Date;
    declare base_reward: number;
    declare blob: string;
    declare block_cumulative_size: number;
    declare block_tself_size: number;
    declare cumulative_diff_adjusted: number;
    declare cumulative_diff_precise: number;
    declare difficulty: number;
    declare effective_fee_median: number;
    declare tx_id: string;
    declare is_orphan: string;
    declare penalty: BigInt;
    declare prev_id: string;
    declare summary_reward: number;
    declare this_block_fee_median: number;
    declare timestamp: Date;
    declare total_fee: number;
    declare total_txs_size: number;
    declare tr_count: BigInt;
    declare type: number;
    declare miner_text_info: string;
    declare pow_seed: string;
    declare already_generated_coins: string;
    declare object_in_json: any;
    
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export type IBlock = Omit<Block, keyof Model | 'createdAt' | 'updatedAt' | 'id'>;

Block.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

        height: { type: DataTypes.INTEGER, allowNull: false },
        actual_timestamp: { type: DataTypes.DATE, allowNull: true },
        base_reward: { type: DataTypes.INTEGER, allowNull: true },
        blob: { type: DataTypes.STRING, allowNull: true },
        block_cumulative_size: { type: DataTypes.INTEGER, allowNull: true },
        block_tself_size: { type: DataTypes.INTEGER, allowNull: true },
        cumulative_diff_adjusted: { type: DataTypes.INTEGER, allowNull: true },
        cumulative_diff_precise: { type: DataTypes.INTEGER, allowNull: true },
        difficulty: { type: DataTypes.INTEGER, allowNull: true },
        effective_fee_median: { type: DataTypes.INTEGER, allowNull: true },
        tx_id: { type: DataTypes.STRING, allowNull: true },
        is_orphan: { type: DataTypes.STRING, allowNull: true },
        penalty: { type: DataTypes.BIGINT, allowNull: true },
        prev_id: { type: DataTypes.STRING, allowNull: true },
        summary_reward: { type: DataTypes.INTEGER, allowNull: true },
        this_block_fee_median: { type: DataTypes.INTEGER, allowNull: true },
        timestamp: { type: DataTypes.DATE, allowNull: true },
        total_fee: { type: DataTypes.INTEGER, allowNull: true },
        total_txs_size: { type: DataTypes.INTEGER, allowNull: true },
        tr_count: { type: DataTypes.BIGINT, allowNull: true },
        type: { type: DataTypes.INTEGER, allowNull: true },
        miner_text_info: { type: DataTypes.STRING, allowNull: true },
        pow_seed: { type: DataTypes.STRING, allowNull: true },
        already_generated_coins: { type: DataTypes.STRING, allowNull: true },
        object_in_json: { type: DataTypes.JSONB, allowNull: true }
    },
    {
        sequelize,
        modelName: "blocks",
        timestamps: true
    }
);

export default Block;
