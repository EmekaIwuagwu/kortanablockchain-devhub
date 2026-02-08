import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST as string;
const dbPassword = process.env.DB_PASSWORD as string;
const dbPort = parseInt(process.env.DB_PORT || '10828');

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false,
        }
    },
    logging: false,
});

export default sequelize;

// Function to connect and sync
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Connection has been established successfully.');

        // Import models here to avoid circular dependency before sequelize is initialized
        const { default: Property } = await import('./Property.js');
        const { default: Investment } = await import('./Investment.js');
        const { default: YieldPayout } = await import('./YieldPayout.js');
        const { default: User } = await import('./User.js');
        const { default: Message } = await import('./Message.js');

        // Define Associations
        Investment.belongsTo(Property, { foreignKey: 'propertyAddress', targetKey: 'address', as: 'property' });
        Property.hasMany(Investment, { foreignKey: 'propertyAddress', sourceKey: 'address', as: 'investments' });

        YieldPayout.belongsTo(Property, { foreignKey: 'propertyAddress', targetKey: 'address', as: 'property' });
        Property.hasMany(YieldPayout, { foreignKey: 'propertyAddress', sourceKey: 'address', as: 'yields' });

        Investment.belongsTo(User, { foreignKey: 'userAddress', targetKey: 'walletAddress', as: 'user' });
        User.hasMany(Investment, { foreignKey: 'userAddress', sourceKey: 'walletAddress', as: 'investments' });

        // Message associations
        Message.belongsTo(User, { foreignKey: 'senderAddress', targetKey: 'walletAddress', as: 'sender' });
        Message.belongsTo(User, { foreignKey: 'receiverAddress', targetKey: 'walletAddress', as: 'receiver' });

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synchronized.');
    } catch (error: any) {
        console.error('❌ Unable to connect to the database:', error);
        // Do not exit if it's just a sync error, but log it
        if (error.name !== 'SequelizeUniqueConstraintError') {
            // process.exit(1); 
        }
    }
};
