import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

class ZanoPrice extends Model {
  declare readonly id: number;
  declare ts_utc: string;
  declare price_close: string;
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
    ts_utc: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    price_close: { type: DataTypes.DECIMAL(20, 10), allowNull: false },
    src: { type: DataTypes.STRING, allowNull: false, defaultValue: "mexc" },
    raw: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    sequelize,
    modelName: "zano_price",
    timestamps: true,
  }
);

export default ZanoPrice;