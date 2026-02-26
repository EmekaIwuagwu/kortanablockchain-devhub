/**
 * Database Index Creation Script for Faucet Requests Collection
 * 
 * This script creates performance indexes on the faucet_requests collection
 * to optimize rate limit queries, cleanup operations, and status-based queries.
 * 
 * Requirements: 3.1, 3.5
 * 
 * Usage:
 *   npx tsx scripts/create-faucet-indexes.ts
 * 
 * Or with ts-node:
 *   npx ts-node scripts/create-faucet-indexes.ts
 */

import { MongoClient } from 'mongodb';

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

        const db = client.db('kortana_presale');
        const collection = db.collection('faucet_requests');

        console.log('\nCreating indexes on faucet_requests collection...\n');

        // Index 1: Compound index for rate limit queries
        // This index optimizes the query: { address: <value>, createdAt: { $gt: <date> } }
        // Used in: Rate limiting check to find recent requests from the same address
        console.log('Creating compound index: { address: 1, createdAt: -1 }');
        await collection.createIndex(
            { address: 1, createdAt: -1 },
            { 
                name: 'address_createdAt_idx',
                background: true 
            }
        );
        console.log('✓ Compound index created successfully');

        // Index 2: Index for cleanup and monitoring queries
        // This index optimizes queries that sort or filter by creation date
        // Used in: Admin monitoring, cleanup of old records, time-based analytics
        console.log('\nCreating index: { createdAt: -1 }');
        await collection.createIndex(
            { createdAt: -1 },
            { 
                name: 'createdAt_idx',
                background: true 
            }
        );
        console.log('✓ CreatedAt index created successfully');

        // Index 3: Compound index for status-based queries
        // This index optimizes queries that filter by status and sort by date
        // Used in: Admin dashboard, monitoring failed/completed requests, analytics
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
