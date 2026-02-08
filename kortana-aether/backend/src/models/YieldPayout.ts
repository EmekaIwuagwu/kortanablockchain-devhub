import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';

class YieldPayout extends Model {
    public id!: number;
    public propertyAddress!: string;
    public userAddress!: string;
    public amountDinar!: string;
    public distributionDate!: Date;
    public txHash!: string;
    public status!: string; // SUCCESS, FAILED
}

YieldPayout.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    propertyAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amountDinar: {
        type: DataTypes.DECIMAL(65, 0),
        allowNull: false,
    },
    distributionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    txHash: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'SUCCESS',
    }
}, {
    sequelize,
    modelName: 'YieldPayout',
    tableName: 'yield_payouts',
});

export default YieldPayout;
