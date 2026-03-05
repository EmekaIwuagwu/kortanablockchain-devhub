export const NETWORKS = {
    testnet: {
        id: 'testnet',
        name: 'Kortana Testnet',
        rpc: 'https://poseidon-rpc.testnet.kortana.xyz/',
        chainId: 72511,
        symbol: 'DNR',
        explorer: 'https://explorer.testnet.kortana.xyz',
        icon: 'K'
    },
    mainnet: {
        id: 'mainnet',
        name: 'Kortana Mainnet',
        rpc: 'https://zeus-rpc.mainnet.kortana.xyz',
        chainId: 9002,
        symbol: 'DNR',
        explorer: 'https://explorer.mainnet.kortana.xyz',
        icon: 'K'
    },
    sepolia: {
        id: 'sepolia',
        name: 'Sepolia ETH',
        rpc: 'https://rpc.ankr.com/eth_sepolia',
        chainId: 11155111,
        symbol: 'ETH',
        explorer: 'https://sepolia.etherscan.io',
        icon: 'E'
    },
    avalancheFuji: {
        id: 'avalancheFuji',
        name: 'Avalanche Fuji',
        rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
        chainId: 43113,
        symbol: 'AVAX',
        explorer: 'https://testnet.snowtrace.io',
        icon: 'A'
    },
    baseSepolia: {
        id: 'baseSepolia',
        name: 'Base Sepolia',
        rpc: 'https://sepolia.base.org',
        chainId: 84532,
        symbol: 'ETH',
        explorer: 'https://sepolia.basescan.org',
        icon: 'B'
    },
    polygonAmoy: {
        id: 'polygonAmoy',
        name: 'Polygon Amoy',
        rpc: 'https://rpc-amoy.polygon.technology',
        chainId: 80002,
        symbol: 'POL',
        explorer: 'https://amoy.polygonscan.com',
        icon: 'P'
    }

};

export type NetworkType = keyof typeof NETWORKS;

// Contract Addresses
export const PRICE_ORACLE_ADDRESS = '0x2B53AF2fF168345C409da33d5cc68270F2905cA7'; // Mainnet Oracle V1
export const KORTANA_BRIDGE_ADDRESS = '0x727D7462a572d5C9427f5304dc436Ec4136eF663';
export const WDNR_ADDRESS = '0xEbd238521aabd9834A1be844a4eBE1acA820b416';

