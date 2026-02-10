import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from './index.js';

interface GoldenVisaAttributes {
    id: number;
    userAddress: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    nationality: string | null;
    occupation: string | null;
    wealthSource: string | null;
    investmentBudget: string | null;
    summary: string | null;
    status: 'ELIGIBILITY' | 'PROFILE' | 'DOCUMENTS' | 'SUBMITTED' | 'PROCESSING' | 'APPROVED_IN_PRINCIPLE' | 'COMPLETED';
}

interface GoldenVisaCreationAttributes extends Optional<GoldenVisaAttributes, 'id' | 'firstName' | 'lastName' | 'email' | 'nationality' | 'occupation' | 'wealthSource' | 'investmentBudget' | 'summary' | 'status'> { }

class GoldenVisaApplication extends Model<GoldenVisaAttributes, GoldenVisaCreationAttributes> implements GoldenVisaAttributes {
    public id!: number;
    public userAddress!: string;
    public firstName!: string | null;
    public lastName!: string | null;
    public email!: string | null;
    public nationality!: string | null;
    public occupation!: string | null;
    public wealthSource!: string | null;
    public investmentBudget!: string | null;
    public summary!: string | null;
    public status!: 'ELIGIBILITY' | 'PROFILE' | 'DOCUMENTS' | 'SUBMITTED' | 'PROCESSING' | 'APPROVED_IN_PRINCIPLE' | 'COMPLETED';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

GoldenVisaApplication.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nationality: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    occupation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    wealthSource: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    investmentBudget: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('ELIGIBILITY', 'PROFILE', 'DOCUMENTS', 'SUBMITTED', 'PROCESSING', 'APPROVED_IN_PRINCIPLE', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'ELIGIBILITY',
    },
}, {
    sequelize,
    tableName: 'golden_visa_applications',
});

export default GoldenVisaApplication;
