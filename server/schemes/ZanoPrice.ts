import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

class ZanoPrice extends Model {
  declare readonly id: number;
  declare ts_utc: number;
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
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      get() {
        const v = this.getDataValue("ts_utc") as unknown;
        return v == null ? null : Number(v);
      },
      set(v: number | string | Date) {
        if (v instanceof Date) {
          this.setDataValue("ts_utc", v.getTime());
        } else {
          this.setDataValue("ts_utc", Number(v));
        }
      },
    },

    price_close: { type: DataTypes.DECIMAL(20, 10), allowNull: false },
    src: { type: DataTypes.STRING, allowNull: false, defaultValue: "mexc" },
    raw: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    sequelize,
    modelName: "zano_price_4h",
    timestamps: true,
    indexes: [
      { fields: ["ts_utc"], unique: true },
      { fields: ["src"] },
    ],
  }
);

export default ZanoPrice;