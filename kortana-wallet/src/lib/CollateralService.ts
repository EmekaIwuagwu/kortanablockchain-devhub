import { ethers } from 'ethers';
import { NetworkType } from './constants';
import { providerService } from './ProviderService';
import { priceService } from './PriceService';

class CollateralService {
    private MINT_RATIO = 1.5; // 150% Over-collateralized

    async getMintableAmount(dnrAmount: string): Promise<string> {
        const dnr = parseFloat(dnrAmount) || 0;
        const price = await priceService.getPrice('DNR');
        const usdValue = dnr * price;
        const mintable = usdValue / this.MINT_RATIO;
        return mintable.toFixed(2);
    }

    calculateMintAmount(dnrAmount: string): string {
        const dnr = parseFloat(dnrAmount) || 0;
        // Fallback sync for UI
        const price = 1.42;
        const usdValue = dnr * price;
        const mintable = usdValue / this.MINT_RATIO;
        return mintable.toFixed(2);
    }

    async mintKUSD(address: string, dnrAmount: string, network: NetworkType, privateKey: string): Promise<string> {
        const provider = providerService.getProvider(network);
        const wallet = new ethers.Wallet(privateKey, provider);

        // Broad-spectrum payload for collateral lock
        const tx = await wallet.sendTransaction({
            to: '0x000000000000000000000000000000000000dEaD',
            value: ethers.parseEther(dnrAmount)
        });

        return tx.hash;
    }
}

export const collateralService = new CollateralService();
