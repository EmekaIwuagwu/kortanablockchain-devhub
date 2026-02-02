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
        default: { http: ['https://poseidon-rpc.kortana.worchsester.xyz'] },
        public: { http: ['https://poseidon-rpc.kortana.worchsester.xyz'] },
    },
    blockExplorers: {
        default: { name: 'Kortana Explorer', url: 'https://explorer.kortana.worchsester.xyz' },
    },
    testnet: true,
})
