const hre = require("hardhat");
const axios = require("axios");

/**
 * Kortana Price Feeder (Mainnet V1)
 * Automatically fetches market prices and pushes them to the on-chain oracle.
 */

const SYMBOLS = ["DNR", "ETH", "USDC", "kUSD", "KR-ESG"];
const ORACLE_ADDRESS = "0xA603b873302EE3D4769C834833ff2c1dfb734d59";

async function getMarketPrice(symbol) {
    // Mapping for CoinGecko IDs
    const idMap = {
        'DNR': 'kortana-dinar',
        'ETH': 'ethereum',
        'USDC': 'usd-coin',
        'kUSD': 'kortana-usd-pulse',
        'KR-ESG': 'kortana-esg-token'
    };

    try {
        const id = idMap[symbol];
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);

        // Return 8-decimal precision for Solidity (e.g. 1.42 -> 142000000)
        const price = response.data[id]?.usd || getFallback(symbol);
        return Math.floor(price * 1e8);
    } catch (error) {
        console.log(`Using fallback for ${symbol}`);
        return Math.floor(getFallback(symbol) * 1e8);
    }
}

function getFallback(symbol) {
    const fallbacks = { 'DNR': 1.42, 'ETH': 2800, 'USDC': 1, 'kUSD': 1, 'KR-ESG': 0.85 };
    return fallbacks[symbol] || 0;
}

async function main() {
    console.log("Starting Kortana Oracle Feeder...");

    const [deployer] = await hre.ethers.getSigners();
    const oracle = await hre.ethers.getContractAt("KortanaPriceOracle", ORACLE_ADDRESS);

    console.log(`Feeder Address: ${deployer.address}`);

    for (const symbol of SYMBOLS) {
        try {
            const price8Decimals = await getMarketPrice(symbol);
            console.log(`Pushing ${symbol} price: $${(price8Decimals / 1e8).toFixed(2)} (${price8Decimals})`);

            const tx = await oracle.updatePrice(symbol, price8Decimals);
            await tx.wait();

            console.log(`✓ ${symbol} updated. Hash: ${tx.hash}`);
        } catch (error) {
            console.error(`✗ Failed to update ${symbol}:`, error.message);
        }
    }

    console.log("Feed cycle complete.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
