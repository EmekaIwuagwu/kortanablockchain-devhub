/**
 * Faucet Database Index Initialization
 * 
 * This module ensures that required indexes exist on the faucet_requests collection.
 * It can be called during application startup to automatically create indexes if they don't exist.
 * 
 * Requirements: 3.1, 3.5
 */

import { MongoClient } from 'mongodb';

let indexesInitialized = false;

/**
 * Initialize database indexes for the faucet_requests collection
 * This function is idempotent - it can be called multiple times safely
 * 
 * @param client - Connected MongoDB client
 */
export async function initFaucetIndexes(client: MongoClient): Promise<void> {
    // Only initialize once per application lifecycle
    if (indexesInitialized) {
        return;
    }

    try {
        const db = client.db('kortana_presale');
        const collection = db.collection('faucet_requests');

        // Create indexes in parallel for faster initialization
        await Promise.all([
            // Index 1: Compound index for rate limit queries
            // Optimizes: { address: <value>, createdAt: { $gt: <date> } }
            collection.createIndex(
                { address: 1, createdAt: -1 },
                { 
                    name: 'address_createdAt_idx',
                    background: true 
                }
            ),

            // Index 2: Index for cleanup and monitoring queries
            // Optimizes: queries that sort or filter by creation date
            collection.createIndex(
                { createdAt: -1 },
                { 
                    name: 'createdAt_idx',
                    background: true 
                }
            ),

            // Index 3: Compound index for status-based queries
            // Optimizes: { status: <value> } with sorting by createdAt
            collection.createIndex(
                { status: 1, createdAt: -1 },
                { 
                    name: 'status_createdAt_idx',
                    background: true 
                }
            )
        ]);

        indexesInitialized = true;
        console.log('Faucet indexes initialized successfully');
    } catch (error) {
        // Log error but don't throw - application should continue even if index creation fails
        // Indexes will be created on next restart or can be created manually
        console.error('Error initializing faucet indexes:', error);
    }
}

/**
 * Reset the initialization flag (useful for testing)
 */
export function resetIndexInitialization(): void {
    indexesInitialized = false;
}
