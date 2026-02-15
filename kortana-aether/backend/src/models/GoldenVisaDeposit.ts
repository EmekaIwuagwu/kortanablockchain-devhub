import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from './index.js';

interface GoldenVisaDepositAttributes {
    id: number;
    userAddress: string;
    propertyId: number;
    applicationId: number | null;
    amount: number;
    txHash: string;
}

export interface GoldenVisaDepositCreationAttributes extends Optional<GoldenVisaDepositAttributes, 'id'> { }

class GoldenVisaDeposit extends Model<GoldenVisaDepositAttributes, GoldenVisaDepositCreationAttributes> implements GoldenVisaDepositAttributes {
    public id!: number;
    public userAddress!: string;
    public propertyId!: number;
    public applicationId!: number | null;
    public amount!: number;
    public txHash!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

GoldenVisaDeposit.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    applicationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    txHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: 'golden_visa_deposits',
});

export default GoldenVisaDeposit;
