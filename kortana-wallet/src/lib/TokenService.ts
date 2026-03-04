import { ethers } from 'ethers';
import { providerService } from './ProviderService';
import { NetworkType } from './constants';

export interface TokenAsset {
    address: string;
    symbol: string;
    decimals: number;
    name: string;
    balance: string;
    network: NetworkType;
    icon?: string;
}

const COMMON_ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function transfer(address to, uint amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint amount)"
];

class TokenService {
    async getTokenData(tokenAddress: string, userAddress: string, network: NetworkType): Promise<TokenAsset | null> {
        try {
            const provider = providerService.getProvider(network);
            const contract = new ethers.Contract(tokenAddress, COMMON_ERC20_ABI, provider);

            const [balance, decimals, symbol, name] = await Promise.all([
                contract.balanceOf(userAddress),
                contract.decimals(),
                contract.symbol(),
                contract.name()
            ]);

            return {
                address: tokenAddress,
                symbol,
                decimals,
                name,
                balance: ethers.formatUnits(balance, decimals),
                network
            };
        } catch (error) {
            console.error(`Failed to fetch token data for ${tokenAddress} on ${network}:`, error);
            return null;
        }
    }

    // Default tokens to track per network if desired
    getDefaultTokens(network: NetworkType): string[] {
        const defaults: Record<string, string[]> = {
            'kortana-testnet': [
                '0x0000000000000000000000000000000000000001', // Example kUSD
            ],
            'sepolia': [
                '0x7798732934214502171292212999421293214212', // Example Link or similar
            ]
        };
        return defaults[network] || [];
    }
}

export const tokenService = new TokenService();
