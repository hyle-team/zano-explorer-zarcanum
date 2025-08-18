import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

class ZanoPrice extends Model {
  declare readonly id: number;
  declare timestamp: string;
  declare price: string;
  declare src: string;
  declare raw: object;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export type IZanoPrice = Omit<
  ZanoPrice,
  keyof Model | "createdAt" | "updatedAt" | "id"
>;

ZanoPrice.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    timestamp: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true
    },
    price: { type: DataTypes.DECIMAL(20, 10), allowNull: false },
    src: { type: DataTypes.STRING, allowNull: false, defaultValue: "mexc" },
    raw: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    sequelize,
    modelName: "zano_price_data",
    timestamps: true,
  }
);

export default ZanoPrice;