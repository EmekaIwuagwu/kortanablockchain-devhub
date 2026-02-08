import { ethers } from 'ethers';
import Property from '../models/Property.js';
import Investment from '../models/Investment.js';
import YieldPayout from '../models/YieldPayout.js';
import abis from '../config/abis.json' with { type: 'json' };

class YieldService {
    private provider: ethers.JsonRpcProvider;
    private signer: ethers.Wallet;

    constructor() {
        const rpcUrl = process.env.KORTANA_RPC_URL || 'https://poseidon-rpc.kortana.worchsester.xyz/';
        this.provider = new ethers.JsonRpcProvider(rpcUrl);

        const privateKey = process.env.ADMIN_PRIVATE_KEY as string;
        this.signer = new ethers.Wallet(privateKey, this.provider);
    }

    /**
     * Distribute monthly yield for a specific property
     */
    async distributeYield(propertyAddress: string) {
        console.log(`💰 Starting yield distribution for property: ${propertyAddress}`);

        try {
            // 1. Get Property Data
            const property = await Property.findOne({ where: { address: propertyAddress } });
            if (!property) throw new Error('Property not found');

            // 2. Get All Confirmed Investments
            const investments = await Investment.findAll({
                where: {
                    propertyAddress,
                    status: 'CONFIRMED'
                }
            });

            if (investments.length === 0) {
                console.log('ℹ️ No confirmed investments found for this property.');
                return;
            }

            // 3. Calculate Total Monthly Yield in Dinar
            // Valuation * Yield % / 12
            const annualYieldUsd = parseFloat(property.valuationUSD) * (parseFloat(property.yield) / 100);
            const monthlyYieldUsd = annualYieldUsd / 12;

            // Assuming 1 USD = 1 DNR for this calculation (simplified)
            const totalMonthlyYieldDinar = monthlyYieldUsd;

            console.log(`📊 Monthly Yield Pool: ${totalMonthlyYieldDinar.toFixed(2)} DNR`);

            // 4. Distribute to each investor proportionally
            const totalSupply = parseFloat(property.totalSupply) / 10 ** 18;

            for (const investment of investments) {
                const investorShare = parseFloat(investment.tokenAmount) / totalSupply;
                const payoutAmount = totalMonthlyYieldDinar * investorShare;

                if (payoutAmount > 0) {
                    const payoutStr = payoutAmount.toFixed(18);
                    console.log(`💸 Sending ${payoutAmount.toFixed(4)} DNR to ${investment.userAddress}...`);

                    try {
                        const tx = await this.signer.sendTransaction({
                            to: investment.userAddress,
                            value: ethers.parseEther(payoutStr)
                        });

                        await tx.wait();
                        console.log(`✅ Payout sent! Tx: ${tx.hash}`);

                        // Record payout in DB
                        await YieldPayout.create({
                            propertyAddress,
                            amountDinar: ethers.parseEther(payoutStr).toString(),
                            txHash: tx.hash,
                            status: 'SUCCESS'
                        });
                    } catch (payoutError) {
                        console.error(`❌ Failed to pay ${investment.userAddress}:`, payoutError);
                        await YieldPayout.create({
                            propertyAddress,
                            amountDinar: ethers.parseEther(payoutStr).toString(),
                            status: 'FAILED'
                        });
                    }
                }
            }

            console.log('✨ Yield distribution completed.');
        } catch (error) {
            console.error('❌ Yield distribution error:', error);
        }
    }
}

export default new YieldService();
