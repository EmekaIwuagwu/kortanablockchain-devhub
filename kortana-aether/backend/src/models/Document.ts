import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from './index.js';

interface DocumentAttributes {
    id: number;
    userAddress: string;
    fileName: string;
    fileUrl: string;
    ipfsHash: string | null;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface DocumentCreationAttributes extends Optional<DocumentAttributes, 'id' | 'status'> { }

class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
    public id!: number;
    public userAddress!: string;
    public fileName!: string;
    public fileUrl!: string;
    public ipfsHash!: string | null;
    public status!: 'PENDING' | 'VERIFIED' | 'REJECTED';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Document.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ipfsHash: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
}, {
    sequelize,
    tableName: 'documents',
});

export default Document;
