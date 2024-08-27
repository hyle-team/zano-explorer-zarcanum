import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

class Asset extends Model {
    declare readonly id: number;
    declare asset_id: string;
    declare logo: string;
    declare price_url: string;
    declare ticker: string;
    declare full_name: string;
    declare total_max_supply: string;
    declare current_supply: string;
    declare decimal_point: number;
    declare meta_info: string;
    declare price: number;
    
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Asset.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

        asset_id: { type: DataTypes.STRING, allowNull: true },
        logo: { type: DataTypes.STRING, allowNull: true },
        price_url: { type: DataTypes.STRING, allowNull: true },
        ticker: { type: DataTypes.STRING, allowNull: true },
        full_name: { type: DataTypes.STRING, allowNull: true },
        total_max_supply: { type: DataTypes.STRING, allowNull: true },
        current_supply: { type: DataTypes.STRING, allowNull: true },
        decimal_point: { type: DataTypes.INTEGER, allowNull: true },
        meta_info: { type: DataTypes.STRING, allowNull: true },
        price: { type: DataTypes.INTEGER, allowNull: true }
    },
    {
        sequelize,
        modelName: "assets",
        timestamps: true
    }
);

export default Asset;
