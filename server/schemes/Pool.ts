import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

class Pool extends Model {
    declare readonly id: number;
    declare blob_size: number;
    declare fee: number;
    declare tx_id: string;
    declare timestamp: Date;
    
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Pool.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        blob_size: { type: DataTypes.INTEGER, allowNull: true },
        fee: { type: DataTypes.DOUBLE, allowNull: true },
        tx_id: { type: DataTypes.STRING, allowNull: true },
        timestamp: { type: DataTypes.DATE, allowNull: true }
    },
    {
        sequelize,
        modelName: "pool",
        timestamps: true
    }
);

export default Pool;