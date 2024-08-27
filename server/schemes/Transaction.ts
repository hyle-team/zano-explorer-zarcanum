import { Model, DataTypes } from "sequelize";
import sequelize from "../database/sequelize";

class Transaction extends Model {
    declare readonly id: number;
    declare keeper_block: BigInt;
    declare tx_id: string;
    declare amount: number;
    declare blob_size: BigInt;
    declare extra: string;
    declare fee: number;
    declare ins: string;
    declare outs: string;
    declare pub_key: string;
    declare timestamp: Date;
    declare attachments: string;

    
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

export type ITransaction = Omit<Transaction, keyof Model | 'createdAt' | 'updatedAt' | 'id'>;

Transaction.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

        keeper_block: { type: DataTypes.BIGINT, allowNull: true },
        tx_id: { type: DataTypes.STRING, allowNull: true },
        amount: { type: DataTypes.INTEGER, allowNull: true },
        blob_size: { type: DataTypes.BIGINT, allowNull: true },
        extra: { type: DataTypes.STRING, allowNull: true },
        fee: { type: DataTypes.INTEGER, allowNull: true },
        ins: { type: DataTypes.STRING, allowNull: true },
        outs: { type: DataTypes.STRING, allowNull: true },
        pub_key: { type: DataTypes.STRING, allowNull: true },
        timestamp: { type: DataTypes.DATE, allowNull: true },
        attachments: { type: DataTypes.STRING, allowNull: true }
    },
    {
        sequelize,
        modelName: "transactions",
        timestamps: true
    }
);

export default Transaction;
