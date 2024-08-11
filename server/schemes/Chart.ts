import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

class Chart extends Model {
    declare readonly id: number;
    declare height: number;
    declare actual_timestamp: Date;
    declare block_cumulative_size: number;
    declare cumulative_diff_precise: number;
    declare difficulty: number;
    declare tr_count: BigInt;
    declare type: number;
    declare difficulty120: number;
    declare hashrate100: number;
    declare hashrate400: number;
    
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Chart.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

        height: { type: DataTypes.INTEGER, allowNull: false },
        actual_timestamp: { type: DataTypes.DATE, allowNull: true },
        block_cumulative_size: { type: DataTypes.INTEGER, allowNull: true },
        cumulative_diff_precise: { type: DataTypes.INTEGER, allowNull: true },
        difficulty: { type: DataTypes.INTEGER, allowNull: true },
        tr_count: { type: DataTypes.BIGINT, allowNull: true },
        type: { type: DataTypes.INTEGER, allowNull: true },
        difficulty120: { type: DataTypes.INTEGER, allowNull: true },
        hashrate100: { type: DataTypes.INTEGER, allowNull: true },
        hashrate400: { type: DataTypes.INTEGER, allowNull: true }
    },
    {
        sequelize,
        modelName: "charts",
        timestamps: true
    }
);

export default Chart;
