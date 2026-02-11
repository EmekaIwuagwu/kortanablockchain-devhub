import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from './index.js';

interface OrderAttributes {
    id: number;
    userAddress: string;
    propertyAddress: string;
    type: 'BUY' | 'SELL';
    price: number; // Price per token in Dinar
    amount: number; // Number of tokens
    filledAmount: number;
    status: 'OPEN' | 'FILLED' | 'CANCELLED';
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'filledAmount' | 'status'> { }

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
    public id!: number;
    public userAddress!: string;
    public propertyAddress!: string;
    public type!: 'BUY' | 'SELL';
    public price!: number;
    public amount!: number;
    public filledAmount!: number;
    public status!: 'OPEN' | 'FILLED' | 'CANCELLED';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Order.init({
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
    type: {
        type: DataTypes.ENUM('BUY', 'SELL'),
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(20, 6),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(20, 6),
        allowNull: false,
    },
    filledAmount: {
        type: DataTypes.DECIMAL(20, 6),
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('OPEN', 'FILLED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'OPEN',
    },
}, {
    sequelize,
    tableName: 'orders',
});

export default Order;
