import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';

class Property extends Model {
    public id!: number;
    public title!: string;
    public symbol!: string;
    public address!: string; // Smart contract address
    public location!: string;
    public country!: string;
    public valuationUSD!: number;
    public totalSupply!: number;
    public metadataURI!: string;
    public images!: string; // JSON string of image URLs
    public type!: string; // Residential, Commercial, High Yield
    public yield!: number; // Expected yield %
    public goldenVisaEligible!: boolean;
}

Property.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        symbol: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        valuationUSD: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        totalSupply: {
            type: DataTypes.DECIMAL(65, 0),
            allowNull: false,
        },
        metadataURI: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        images: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Residential',
        },
        yield: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
        },
        goldenVisaEligible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    },
    {
        sequelize,
        tableName: 'properties',
    }
);

export default Property;
