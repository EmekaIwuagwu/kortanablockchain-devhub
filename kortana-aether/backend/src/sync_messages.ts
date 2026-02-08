import Message from './models/Message.js';
import User from './models/User.js';
import sequelize from './models/index.js';

async function syncMessages() {
    console.log('Syncing Message model...');
    try {
        // We need to define associations if they are used
        Message.belongsTo(User, { foreignKey: 'senderAddress', targetKey: 'walletAddress', as: 'sender' });
        Message.belongsTo(User, { foreignKey: 'receiverAddress', targetKey: 'walletAddress', as: 'receiver' });

        await Message.sync({ alter: true });
        console.log('Message table synchronized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to sync Message table:', error);
        process.exit(1);
    }
}

syncMessages();
