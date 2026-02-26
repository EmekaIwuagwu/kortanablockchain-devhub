# Kortana Faucet Troubleshooting Guide

## Table of Contents

1. [Common Issues](#common-issues)
2. [Error Messages](#error-messages)
3. [Database Issues](#database-issues)
4. [Network Issues](#network-issues)
5. [Configuration Issues](#configuration-issues)
6. [Performance Issues](#performance-issues)
7. [Debugging Tools](#debugging-tools)
8. [FAQ](#faq)

## Common Issues

### Issue: "Database temporarily unavailable"

**Symptoms**:
- Error message: "Database temporarily unavailable"
- HTTP Status: 503
- Occurs on every request

**Possible Causes**:
1. MongoDB is not running
2. Incorrect `MONGODB_URI` in environment variables
3. Network connectivity issues to MongoDB
4. MongoDB authentication failure
5. Database server overloaded

**Solutions**:

1. **Check if MongoDB is running**:
   ```bash
   # For local MongoDB
   mongosh
   
   # Or check the process
   ps aux | grep mongod
   ```

2. **Verify environment variable**:
   ```bash
   # Check .env.local file
   cat .env.local | grep MONGODB_URI
   
   # Should look like:
   # MONGODB_URI=mongodb://localhost:27017/kortana_presale
   ```

3. **Test MongoDB connection**:
   ```bash
   mongosh "mongodb://localhost:27017/kortana_presale"
   ```

4. **Check MongoDB logs**:
   ```bash
   # Location varies by installation
   tail -f /var/log/mongodb/mongod.log
   ```

5. **Restart MongoDB**:
   ```bash
   # Linux/Mac
   sudo systemctl restart mongod
   
   # Or
   brew services restart mongodb-community
   ```

6. **For MongoDB Atlas** (hosted):
   - Check network access whitelist
   - Verify credentials
   - Check cluster status in Atlas dashboard

---

### Issue: "Request to blockchain timed out"

**Symptoms**:
- Error message: "Request to blockchain timed out. Please try again."
- HTTP Status: 504
- Takes exactly 30 seconds before failing

**Possible Causes**:
1. RPC endpoint is down or slow
2. Network connectivity issues
3. Firewall blocking outbound requests
4. RPC endpoint overloaded

**Solutions**:

1. **Test RPC endpoint directly**:
   ```bash
   curl -X POST https://poseidon-rpc.testnet.kortana.xyz/ \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "method": "eth_blockNumber",
       "params": [],
       "id": 1
     }'
   ```

2. **Check RPC endpoint configuration**:
   ```bash
   # Verify environment variable
   cat .env.local | grep RPC_URL
   ```

3. **Increase timeout** (if needed):
   ```env
   # In .env.local
   FAUCET_RPC_TIMEOUT_MS=60000  # 60 seconds
   ```

4. **Check network connectivity**:
   ```bash
   ping poseidon-rpc.testnet.kortana.xyz
   ```

5. **Try alternative RPC endpoint** (if available):
   ```env
   NEXT_PUBLIC_TESTNET_RPC_URL=https://alternative-rpc.testnet.kortana.xyz/
   ```

---

### Issue: "Rate limit exceeded"

**Symptoms**:
- Error message: "Rate limit exceeded. You can request tokens again in Xh Ym."
- HTTP Status: 429
- Occurs when requesting with same address within 24 hours

**Possible Causes**:
1. Address already requested tokens within 24 hours (expected behavior)
2. System clock incorrect
3. Database records not cleaned up

**Solutions**:

1. **Wait for cooldown period** (expected behavior):
   - The error message shows exactly how long to wait
   - This is working as designed

2. **Use a different address**:
   - Each address has its own cooldown
   - You can request with a different wallet

3. **Check system time**:
   ```bash
   date
   # Should show correct current time
   ```

4. **Verify database records**:
   ```bash
   mongosh
   use kortana_presale
   db.faucet_requests.find({ 
     address: "0x..." 
   }).sort({ createdAt: -1 }).limit(1)
   ```

5. **For testing, manually clear rate limit**:
   ```bash
   mongosh
   use kortana_presale
   db.faucet_requests.deleteMany({ 
     address: "0x..." 
   })
   ```
   ⚠️ **Warning**: Only do this in development!

6. **Adjust rate limit duration** (development only):
   ```env
   # In .env.local
   FAUCET_RATE_LIMIT_HOURS=1  # 1 hour instead of 24
   ```

---

### Issue: "Invalid wallet address format"

**Symptoms**:
- Error message: "Invalid wallet address format. Must be 0x followed by 40 hexadecimal characters."
- HTTP Status: 400
- Occurs immediately on submission

**Possible Causes**:
1. Address missing "0x" prefix
2. Address too short or too long
3. Address contains invalid characters
4. Copy-paste error

**Solutions**:

1. **Verify address format**:
   - Must start with `0x`
   - Must be exactly 42 characters (0x + 40 hex)
   - Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

2. **Copy address from wallet**:
   - Open MetaMask or your wallet
   - Click on account name to copy
   - Paste directly into faucet

3. **Check for extra spaces**:
   ```javascript
   // Address should not have spaces
   // Bad:  " 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb "
   // Good: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
   ```

4. **Validate address manually**:
   ```javascript
   const address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
   const isValid = /^0x[0-9a-fA-F]{40}$/.test(address);
   console.log(isValid); // Should be true
   ```

---

### Issue: "Unable to connect to blockchain"

**Symptoms**:
- Error message: "Unable to connect to blockchain. Please try again later."
- HTTP Status: 503
- Occurs intermittently

**Possible Causes**:
1. Network connectivity issues
2. DNS resolution failure
3. RPC endpoint temporarily down
4. Firewall or proxy blocking requests

**Solutions**:

1. **Check internet connection**:
   ```bash
   ping 8.8.8.8
   ```

2. **Test DNS resolution**:
   ```bash
   nslookup poseidon-rpc.testnet.kortana.xyz
   ```

3. **Check RPC endpoint status**:
   - Visit network status page
   - Check Kortana Discord/Twitter for announcements

4. **Try from different network**:
   - Switch from WiFi to mobile data
   - Try from different location

5. **Check firewall settings**:
   ```bash
   # Linux
   sudo ufw status
   
   # Check if port 443 (HTTPS) is allowed
   ```

6. **Use VPN** (if corporate firewall):
   - Some corporate networks block blockchain RPCs
   - Try connecting through VPN

---

## Error Messages

### Validation Errors (400)

#### "Wallet address is required"
- **Cause**: Empty address field
- **Solution**: Enter a valid wallet address

#### "Invalid network selection"
- **Cause**: Network parameter is not "testnet" or "devnet"
- **Solution**: Use correct network value

#### "Request payload too large"
- **Cause**: Request body exceeds 10KB
- **Solution**: Reduce request size (shouldn't happen in normal use)

#### "Invalid request format"
- **Cause**: Malformed JSON in request body
- **Solution**: Ensure JSON is properly formatted

### RPC Errors (502)

#### "Blockchain error: Insufficient funds in faucet"
- **Cause**: Faucet wallet has no tokens
- **Solution**: Contact administrators to refill faucet

#### "Blockchain error: Invalid method"
- **Cause**: RPC endpoint doesn't support eth_requestDNR
- **Solution**: Verify RPC endpoint URL is correct

#### "Received invalid response from blockchain"
- **Cause**: RPC response doesn't match expected format
- **Solution**: Check RPC endpoint compatibility

### Database Errors (500/503)

#### "Failed to record request"
- **Cause**: Database write operation failed
- **Solution**: Check MongoDB connection and permissions

#### "Database temporarily unavailable"
- **Cause**: Cannot connect to MongoDB
- **Solution**: See [Database Issues](#database-issues) section

## Database Issues

### Cannot Connect to MongoDB

**Diagnostic Steps**:

1. **Check if MongoDB is running**:
   ```bash
   # Check process
   ps aux | grep mongod
   
   # Check service status
   sudo systemctl status mongod
   ```

2. **Test connection**:
   ```bash
   mongosh "mongodb://localhost:27017/kortana_presale"
   ```

3. **Check MongoDB logs**:
   ```bash
   tail -f /var/log/mongodb/mongod.log
   ```

4. **Verify port is open**:
   ```bash
   netstat -an | grep 27017
   ```

**Common Fixes**:

1. **Start MongoDB**:
   ```bash
   sudo systemctl start mongod
   ```

2. **Check configuration**:
   ```bash
   cat /etc/mongod.conf
   ```

3. **Verify data directory permissions**:
   ```bash
   ls -la /var/lib/mongodb
   sudo chown -R mongodb:mongodb /var/lib/mongodb
   ```

### Slow Database Queries

**Symptoms**:
- Requests take several seconds
- Rate limit checks are slow

**Diagnostic Steps**:

1. **Check if indexes exist**:
   ```bash
   mongosh
   use kortana_presale
   db.faucet_requests.getIndexes()
   ```

2. **Analyze query performance**:
   ```javascript
   db.faucet_requests.find({
     address: "0x...",
     createdAt: { $gt: new Date(Date.now() - 24*60*60*1000) }
   }).explain("executionStats")
   ```

**Solutions**:

1. **Create indexes**:
   ```bash
   npm run db:create-indexes
   ```

2. **Rebuild indexes**:
   ```javascript
   db.faucet_requests.reIndex()
   ```

3. **Clean up old records**:
   ```javascript
   db.faucet_requests.deleteMany({
     createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
   })
   ```

### Database Connection Pool Exhausted

**Symptoms**:
- Intermittent connection errors
- "Too many connections" errors

**Solutions**:

1. **Check connection pool settings** in `lib/mongodb.ts`

2. **Increase pool size** (if needed):
   ```typescript
   // In mongodb.ts
   const options = {
     maxPoolSize: 20, // Increase from default
   }
   ```

3. **Monitor active connections**:
   ```javascript
   db.serverStatus().connections
   ```

## Network Issues

### RPC Endpoint Not Responding

**Diagnostic Steps**:

1. **Test with curl**:
   ```bash
   curl -X POST https://poseidon-rpc.testnet.kortana.xyz/ \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

2. **Check response time**:
   ```bash
   time curl -X POST https://poseidon-rpc.testnet.kortana.xyz/ \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

3. **Test from different location**:
   - Use online tools like httpstat.us
   - Try from different server/network

**Solutions**:

1. **Use alternative endpoint** (if available)
2. **Increase timeout**
3. **Contact RPC provider**
4. **Set up fallback endpoints**

### CORS Errors

**Symptoms**:
- Browser console shows CORS error
- Request fails with network error
- Works in curl but not in browser

**Solutions**:

1. **Add your domain to allowed origins**:
   ```typescript
   // In app/api/faucet/request/route.ts
   const ALLOWED_ORIGINS = [
     'http://localhost:3000',
     'https://yourdomain.com', // Add your domain
   ];
   ```

2. **Check browser console** for exact error

3. **Verify Origin header** is being sent

4. **Test with CORS disabled** (development only):
   - Use browser extension to disable CORS
   - If it works, it's a CORS configuration issue

## Configuration Issues

### Environment Variables Not Loading

**Symptoms**:
- Using default values instead of configured values
- "undefined" in logs

**Solutions**:

1. **Verify .env.local exists**:
   ```bash
   ls -la .env.local
   ```

2. **Check file format**:
   ```bash
   cat .env.local
   # Should not have spaces around =
   # Good: MONGODB_URI=mongodb://localhost:27017
   # Bad:  MONGODB_URI = mongodb://localhost:27017
   ```

3. **Restart development server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Check for typos**:
   - Variable names are case-sensitive
   - Must match exactly

5. **Verify Next.js can read variables**:
   ```typescript
   console.log('MongoDB URI:', process.env.MONGODB_URI);
   console.log('RPC URL:', process.env.NEXT_PUBLIC_TESTNET_RPC_URL);
   ```

### Wrong Network Configuration

**Symptoms**:
- Requests go to wrong network
- Chain ID mismatch errors

**Solutions**:

1. **Verify network configuration** in `lib/rpc.ts`:
   ```typescript
   export const NETWORK = {
     testnet: {
       chainId: 72511,
       rpcUrl: "https://poseidon-rpc.testnet.kortana.xyz/",
       // ...
     }
   }
   ```

2. **Check environment variables**:
   ```bash
   cat .env.local | grep RPC_URL
   ```

3. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

## Performance Issues

### Slow Response Times

**Diagnostic Steps**:

1. **Check API response time**:
   ```bash
   time curl -X POST http://localhost:3000/api/faucet/request \
     -H "Content-Type: application/json" \
     -d '{"address":"0x...","network":"testnet"}'
   ```

2. **Check database query time**:
   ```javascript
   db.faucet_requests.find({...}).explain("executionStats")
   ```

3. **Check RPC response time**:
   ```bash
   time curl -X POST https://poseidon-rpc.testnet.kortana.xyz/ \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

**Solutions**:

1. **Optimize database queries**:
   - Ensure indexes are created
   - Clean up old records

2. **Increase RPC timeout** (if RPC is slow):
   ```env
   FAUCET_RPC_TIMEOUT_MS=60000
   ```

3. **Use connection pooling**:
   - Already implemented in `lib/mongodb.ts`

4. **Monitor server resources**:
   ```bash
   top
   # Check CPU and memory usage
   ```

### High Memory Usage

**Solutions**:

1. **Check for memory leaks**:
   ```bash
   node --inspect npm run dev
   # Use Chrome DevTools to profile
   ```

2. **Limit database connection pool**:
   ```typescript
   // In mongodb.ts
   maxPoolSize: 10
   ```

3. **Clean up old database records**:
   ```javascript
   db.faucet_requests.deleteMany({
     createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
   })
   ```

## Debugging Tools

### Enable Debug Logging

Add to `.env.local`:
```env
NODE_ENV=development
DEBUG=*
```

### Check Application Logs

```bash
# Development
npm run dev
# Watch console output

# Production
pm2 logs kortana-web
```

### MongoDB Debugging

```bash
# Connect to MongoDB
mongosh

# Switch to database
use kortana_presale

# View recent requests
db.faucet_requests.find().sort({createdAt:-1}).limit(10).pretty()

# Count requests by status
db.faucet_requests.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

# Find requests by address
db.faucet_requests.find({ address: "0x..." }).pretty()

# Check indexes
db.faucet_requests.getIndexes()
```

### Network Debugging

```bash
# Test RPC endpoint
curl -v -X POST https://poseidon-rpc.testnet.kortana.xyz/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check DNS
nslookup poseidon-rpc.testnet.kortana.xyz

# Trace route
traceroute poseidon-rpc.testnet.kortana.xyz

# Check SSL certificate
openssl s_client -connect poseidon-rpc.testnet.kortana.xyz:443
```

### Browser Debugging

1. **Open Developer Tools** (F12)
2. **Check Console** for errors
3. **Check Network tab** for failed requests
4. **Check Application tab** for storage issues

## FAQ

### Q: Can I request tokens multiple times per day?

**A**: No, each wallet address is limited to one request per 24 hours. This prevents abuse and ensures fair distribution.

### Q: Can I use the same address on different networks?

**A**: Yes, rate limiting is per address per network. You can request on both testnet and devnet with the same address.

### Q: What if I don't receive tokens?

**A**: Check:
1. Transaction hash in the success message
2. Your wallet address is correct
3. You're connected to the correct network (Chain ID 72511 for testnet)
4. Transaction on the block explorer
5. Wait a few minutes for confirmation

### Q: Can I increase the rate limit?

**A**: For development, you can adjust `FAUCET_RATE_LIMIT_HOURS` in `.env.local`. For production, contact administrators.

### Q: How do I check my token balance?

**A**: 
1. Add Kortana network to MetaMask
2. Check balance in wallet
3. Or use block explorer: https://explorer.testnet.kortana.xyz

### Q: What if the faucet runs out of tokens?

**A**: Contact the Kortana team. Administrators need to refill the faucet wallet.

### Q: Can I request more than 500 DNR?

**A**: No, the amount is fixed at 500 DNR per request. This is configured in `FAUCET_AMOUNT`.

### Q: Is there an API rate limit?

**A**: Yes, one request per address per 24 hours. There's no IP-based rate limiting currently.

### Q: Can I use this on mainnet?

**A**: No, the faucet is only for testnet and devnet. Mainnet tokens have real value and cannot be distributed freely.

### Q: How do I report a bug?

**A**: 
1. Check this troubleshooting guide first
2. Check existing GitHub issues
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Browser/environment details
   - Screenshots if applicable

## Getting Help

If you've tried the solutions above and still have issues:

1. **Check Documentation**:
   - [FAUCET_DOCUMENTATION.md](./FAUCET_DOCUMENTATION.md)
   - [FAUCET_API.md](./FAUCET_API.md)

2. **Community Support**:
   - Kortana Discord
   - Kortana Telegram
   - GitHub Discussions

3. **Report Issues**:
   - GitHub Issues
   - Email: support@kortana.xyz

4. **Include in Report**:
   - Error message (exact text)
   - Steps to reproduce
   - Environment (OS, browser, Node version)
   - Relevant logs
   - Screenshots

---

**Last Updated**: February 2026  
**Maintained By**: Kortana Development Team
