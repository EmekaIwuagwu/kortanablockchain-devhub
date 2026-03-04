require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        kortana_testnet: {
            url: "https://poseidon-rpc.testnet.kortana.xyz/",
            chainId: 72511,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
        avalanche_fuji: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            chainId: 43113,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
        base_sepolia: {
            url: "https://sepolia.base.org",
            chainId: 84532,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
        sepolia: {
            url: "https://rpc.ankr.com/eth_sepolia",
            chainId: 11155111,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        },
        polygon_amoy: {
            url: "https://rpc-amoy.polygon.technology",
            chainId: 80002,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
        }

    }
};
