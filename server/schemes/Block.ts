import { Model, DataTypes } from 'sequelize';
import sequelize from '../database/sequelize';

class Block extends Model {
	declare readonly id: number;
	declare height: number;
	declare actual_timestamp: number;
	declare base_reward: string;
	declare blob: string;
	declare block_cumulative_size: number;
	declare block_tself_size: number;
	declare cumulative_diff_adjusted: number;
	declare cumulative_diff_precise: number;
	declare difficulty: number;
	declare effective_fee_median: number;
	declare tx_id: string;
	declare is_orphan: boolean;
	declare penalty: number;
	declare prev_id: string;
	declare summary_reward: string;
	declare this_block_fee_median: number;
	declare timestamp: number;
	declare total_fee: string;
	declare total_txs_size: number;
	declare tr_count: number;
	declare type: string;
	declare miner_text_info: string | undefined;
	declare pow_seed: string;
	declare already_generated_coins: string;
	declare object_in_json: string | undefined;

	declare readonly createdAt: Date;
	declare readonly updatedAt: Date;
}

export type IBlock = Omit<Block, keyof Model | 'createdAt' | 'updatedAt' | 'id'>;

Block.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

		height: { type: DataTypes.INTEGER, allowNull: false, unique: true },
		actual_timestamp: { type: DataTypes.BIGINT, allowNull: true },
		base_reward: { type: DataTypes.TEXT, allowNull: true },
		blob: { type: DataTypes.STRING, allowNull: true },
		block_cumulative_size: { type: DataTypes.TEXT, allowNull: true },
		block_tself_size: { type: DataTypes.TEXT, allowNull: true },
		cumulative_diff_adjusted: { type: DataTypes.TEXT, allowNull: true },
		cumulative_diff_precise: { type: DataTypes.TEXT, allowNull: true },
		difficulty: { type: DataTypes.TEXT, allowNull: true },
		effective_fee_median: { type: DataTypes.TEXT, allowNull: true },
		tx_id: { type: DataTypes.STRING, allowNull: true },
		is_orphan: { type: DataTypes.BOOLEAN, allowNull: true },
		penalty: { type: DataTypes.TEXT, allowNull: true },
		prev_id: { type: DataTypes.STRING, allowNull: true },
		summary_reward: { type: DataTypes.TEXT, allowNull: true },
		this_block_fee_median: { type: DataTypes.TEXT, allowNull: true },
		timestamp: { type: DataTypes.BIGINT, allowNull: true },
		total_fee: { type: DataTypes.TEXT, allowNull: true },
		total_txs_size: { type: DataTypes.TEXT, allowNull: true },
		tr_count: { type: DataTypes.TEXT, allowNull: true },
		type: { type: DataTypes.TEXT, allowNull: true },
		miner_text_info: { type: DataTypes.STRING, allowNull: true },
		pow_seed: { type: DataTypes.STRING, allowNull: true },
		already_generated_coins: { type: DataTypes.STRING, allowNull: true },
		object_in_json: { type: DataTypes.JSONB, allowNull: true },
	},
	{
		sequelize,
		modelName: 'blocks',
		timestamps: true,
		indexes: [
			{
				fields: ['height'],
			},
		],
	},
);

// Block.hasMany(Transaction, { foreignKey: 'keeper_block', sourceKey: 'height' });

export default Block;
