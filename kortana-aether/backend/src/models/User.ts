import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';

class User extends Model {
    declare id: number;
    declare walletAddress: string;
    declare name: string;
    declare email: string;
    declare kycStatus: string; // PENDING, APPROVED, REJECTED
    declare role: string; // USER, ADMIN, BUYER, SELLER
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    walletAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    kycStatus: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'USER',
    }
}, {
    sequelize,
    modelName: 'User',
});

export default User;
