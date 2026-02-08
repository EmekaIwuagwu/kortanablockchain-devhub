import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';

class Message extends Model {
    declare id: number;
    declare senderAddress: string;
    declare receiverAddress: string;
    declare content: string;
    declare isRead: boolean;
    declare createdAt: Date;
}

Message.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    senderAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    receiverAddress: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true,
});

export default Message;
