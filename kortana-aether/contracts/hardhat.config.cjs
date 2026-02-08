require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            evmVersion: "paris",
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        hardhat: {
            chainId: 31337
        },
        localhost: {
            url: "http://127.0.0.1:8545"
        },
        kortana_testnet: {
            url: "https://poseidon-rpc.kortana.worchsester.xyz/",
            chainId: 72511,
            accounts: ["0xef3c8edcf70855ba073cb9ef556b5cb8a0d20aea57a0bf2dceb3210b0c8c4792"],
            gas: 5000000,
            gasPrice: 2000000000, // 2 Gwei
            timeout: 120000
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
