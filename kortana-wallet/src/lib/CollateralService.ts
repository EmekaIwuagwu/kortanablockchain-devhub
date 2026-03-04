import { ethers } from 'ethers';
import { NetworkType } from './constants';
import { providerService } from './ProviderService';

class CollateralService {
    private MINT_RATIO = 1.5; // 150% Over-collateralized
    private MOCK_DNR_PRICE = 1.25; // $1.25 per DNR

    calculateMintAmount(dnrAmount: string): string {
        const dnr = parseFloat(dnrAmount) || 0;
        const usdValue = dnr * this.MOCK_DNR_PRICE;
        const mintable = usdValue / this.MINT_RATIO;
        return mintable.toFixed(2);
    }

    async mintKUSD(address: string, dnrAmount: string, network: NetworkType, privateKey: string): Promise<string> {
        const provider = providerService.getProvider(network);
        const wallet = new ethers.Wallet(privateKey, provider);

        // Mock Contract Interaction
        // In reality: collateralManager.deposit{value: dnrAmount}()
        const tx = await wallet.sendTransaction({
            to: '0x000000000000000000000000000000000000dEaD', // Burn for collateral simulation
            value: ethers.parseEther(dnrAmount)
        });

        return tx.hash;
    }
}

export const collateralService = new CollateralService();
