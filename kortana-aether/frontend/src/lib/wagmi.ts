import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

const kortana = {
    id: 72511,
    name: 'Kortana',
    nativeCurrency: { name: 'Dinar', symbol: 'DNR', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://poseidon-rpc.kortana.worchsester.xyz/'] },
    },
    blockExplorers: {
        default: { name: 'Kortana Explorer', url: 'https://explorer.kortana.org' },
    },
    testnet: true,
};

export const config = getDefaultConfig({
    appName: 'Aether Platform',
    projectId: 'YOUR_PROJECT_ID', // Placeholder
    chains: [kortana],
    transports: {
        [kortana.id]: http(),
    },
});
