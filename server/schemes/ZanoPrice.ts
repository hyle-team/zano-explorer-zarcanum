import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../database/sequelize";

interface ZanoPriceAttributes {
  ts_utc: Date;
  price_close: string;
  src?: string;
  raw: object;
  createdAt?: Date;
  updatedAt?: Date;
}

type ZanoPriceCreation = Optional<ZanoPriceAttributes, "src" | "createdAt" | "updatedAt">;

class ZanoPrice extends Model<ZanoPriceAttributes, ZanoPriceCreation>
  implements ZanoPriceAttributes {
  public ts_utc!: Date;
  public price_close!: string;
  public src!: string;
  public raw!: object;
}

ZanoPrice.init(
  {
    ts_utc: {
      type: DataTypes.DATE,
      primaryKey: true,
      allowNull: false
    },
    price_close: {
      type: DataTypes.DECIMAL(20, 10),
      allowNull: false
    },
    src: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "mexc"
    },
    raw: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "zano_price_4h",
    timestamps: true
  }
);

export default ZanoPrice;