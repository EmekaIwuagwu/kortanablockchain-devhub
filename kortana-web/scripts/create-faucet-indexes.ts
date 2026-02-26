import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not set');
    process.exit(1);
}

async function createIndexes() {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined');
    }
    const client = new MongoClient(MONGODB_URI);

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected successfully');

        const db = client.db('faucet');
        const collection = db.collection('faucet_requests');

        console.log('\nCreating indexes on faucet_requests collection...\n');

        console.log('Creating compound index: { address: 1, createdAt: -1 }');
        await collection.createIndex(
            { address: 1, createdAt: -1 },
            { 
                name: 'address_createdAt_idx',
                background: true 
            }
        );
        console.log('✓ Compound index created successfully');

        console.log('\nCreating index: { createdAt: -1 }');
        await collection.createIndex(
            { createdAt: -1 },
            { 
                name: 'createdAt_idx',
                background: true 
            }
        );
        console.log('✓ CreatedAt index created successfully');

        console.log('\nCreating compound index: { status: 1, createdAt: -1 }');
        await collection.createIndex(
            { status: 1, createdAt: -1 },
            { 
                name: 'status_createdAt_idx',
                background: true 
            }
        );
        console.log('✓ Status compound index created successfully');

        // List all indexes to verify
        console.log('\n--- Current Indexes on faucet_requests ---');
        const indexes = await collection.indexes();
        indexes.forEach((index) => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });

        console.log('\n✅ All indexes created successfully!');

    } catch (error) {
        console.error('Error creating indexes:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the script
createIndexes().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
