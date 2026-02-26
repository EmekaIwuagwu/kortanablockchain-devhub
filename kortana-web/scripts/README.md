# Database Scripts

This directory contains database maintenance and migration scripts for the Kortana Web application.

## Faucet Index Creation

### Overview

The `create-faucet-indexes.ts` script creates performance indexes on the `faucet_requests` collection to optimize database queries.

### Indexes Created

1. **Compound Index: `{ address: 1, createdAt: -1 }`**
   - Name: `address_createdAt_idx`
   - Purpose: Optimizes rate limit queries that check for recent requests from a specific address
   - Used by: Rate limiting logic in the faucet API

2. **Single Index: `{ createdAt: -1 }`**
   - Name: `createdAt_idx`
   - Purpose: Optimizes time-based queries for cleanup and monitoring
   - Used by: Admin dashboards, cleanup jobs, analytics

3. **Compound Index: `{ status: 1, createdAt: -1 }`**
   - Name: `status_createdAt_idx`
   - Purpose: Optimizes queries that filter by request status and sort by date
   - Used by: Admin monitoring, failed request tracking, analytics

### Usage

#### Prerequisites

Ensure you have the `MONGODB_URI` environment variable set:

```bash
export MONGODB_URI="mongodb://your-connection-string"
```

Or create a `.env.local` file in the project root:

```
MONGODB_URI=mongodb://your-connection-string
```

#### Running the Script

Using tsx (recommended):
```bash
npx tsx scripts/create-faucet-indexes.ts
```

Using ts-node:
```bash
npx ts-node scripts/create-faucet-indexes.ts
```

#### Automatic Index Creation

Indexes are also automatically created when the application starts, thanks to the `initFaucetIndexes` function in `lib/initFaucetIndexes.ts`. This ensures indexes exist even if the script hasn't been run manually.

### When to Run

- **Initial Setup**: Run once when setting up a new database
- **After Database Reset**: Run if the database is dropped and recreated
- **Manual Verification**: Run to verify indexes exist and are properly configured

### Verification

After running the script, you can verify the indexes were created by:

1. Checking the script output for success messages
2. Using MongoDB Compass or mongo shell:
   ```javascript
   use kortana_presale
   db.faucet_requests.getIndexes()
   ```

### Notes

- Indexes are created with `background: true` to avoid blocking database operations
- The script is idempotent - running it multiple times is safe
- Index creation may take time on large collections
- The application will continue to work without indexes, but performance may be degraded

### Troubleshooting

**Error: MONGODB_URI environment variable is not set**
- Ensure the environment variable is properly set before running the script

**Connection timeout errors**
- Check your network connection
- Verify the MongoDB URI is correct
- Ensure the MongoDB server is running and accessible

**Permission errors**
- Ensure your MongoDB user has the necessary permissions to create indexes
- The user needs `createIndex` privilege on the database
