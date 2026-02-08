import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';

class Investment extends Model {
    public id!: number;
    public userAddress!: string;
    public propertyAddress!: string;
    public tokenAmount!: number;
    public dinarPaid!: number;
    public txHash!: string;
    public status!: string; // PENDING, CONFIRMED, FAILED
}

Investment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        propertyAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tokenAmount: {
            type: DataTypes.DECIMAL(20, 6),
            allowNull: false,
        },
        dinarPaid: {
            type: DataTypes.DECIMAL(20, 6),
            allowNull: false,
        },
        txHash: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'PENDING',
        }
    },
    {
        sequelize,
        tableName: 'investments',
    }
);

export default Investment;
