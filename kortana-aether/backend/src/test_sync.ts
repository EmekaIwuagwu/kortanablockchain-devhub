import sequelize from './models/index.js';
import Document from './models/Document.js';

async function testSync() {
    try {
        await sequelize.authenticate();
        console.log('Auth success');
        await sequelize.sync({ alter: true });
        console.log('Database sync success');
        process.exit(0);
    } catch (error: any) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

testSync();
