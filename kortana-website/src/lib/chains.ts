import { defineChain } from 'viem'

export const kortanaTestnet = defineChain({
    id: 72511,
    name: 'Kortana Poseidon',
    network: 'kortana-testnet',
    nativeCurrency: {
        name: 'Kortana',
        symbol: 'DNR',
        decimals: 18
    },
    rpcUrls: {
        default: { http: ['https://poseidon-rpc.kortana.name.ng'] },
        public: { http: ['https://poseidon-rpc.kortana.name.ng'] },
    },
    blockExplorers: {
        default: { name: 'Kortana Explorer', url: 'https://explorer.kortana.name.ng' },
    },
    testnet: true,
})
