import { connectDB } from './models/index.js';

async function runSync() {
    console.log('Starting manual database synchronization...');
    try {
        await connectDB();
        console.log('Database synchronization completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Database synchronization failed:', error);
        process.exit(1);
    }
}

runSync();
