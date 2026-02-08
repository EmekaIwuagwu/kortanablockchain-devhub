import { ethers } from 'ethers';
import dotenv from 'dotenv';
import Property from '../models/Property.js';
import Investment from '../models/Investment.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Load ABIs
const abisPath = path.resolve('../frontend/src/config/abis.json');
const abis = JSON.parse(fs.readFileSync(abisPath, 'utf8'));

class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private escrowManager: ethers.Contract;
    private signer: ethers.Wallet;

    constructor() {
        const rpcUrl = process.env.KORTANA_RPC_URL || 'https://poseidon-rpc.kortana.worchsester.xyz/';
        this.provider = new ethers.JsonRpcProvider(rpcUrl);

        const privateKey = process.env.ADMIN_PRIVATE_KEY as string;
        this.signer = new ethers.Wallet(privateKey, this.provider);

        const escrowAddress = process.env.ESCROW_MANAGER_ADDRESS as string;
        this.escrowManager = new ethers.Contract(escrowAddress, abis.EscrowManager, this.signer);
    }

    async startListening() {
        console.log('📡 Starting Blockchain Event Listeners...');
        console.log(`🤖 Auto-confirmation bot active (Address: ${this.signer.address})`);

        // 1. Listen for EscrowInitiated
        this.escrowManager.on('EscrowInitiated', async (escrowId, buyer, seller, tokenAmount, dinarAmount, event) => {
            console.log(`📦 New Investment detected! Escrow ID: ${escrowId}`);

            try {
                // Find property by token address
                const escrowData = await this.escrowManager.getFunction('escrows')(escrowId);
                const propertyTokenAddress = escrowData.propertyToken;

                await Investment.create({
                    userAddress: buyer,
                    propertyAddress: propertyTokenAddress,
                    tokenAmount: ethers.formatUnits(tokenAmount, 18),
                    dinarPaid: ethers.formatEther(dinarAmount),
                    txHash: event.log.transactionHash,
                    status: 'PENDING'
                });

                console.log(`✅ Investment recorded in DB (Escrow ID: ${escrowId})`);

                // ATTEMPT AUTO-CONFIRMATION
                console.log(`⏳ Auto-confirming Escrow ID: ${escrowId}...`);

                // Confirm as Seller
                const tx1 = await this.escrowManager.getFunction('confirmEscrowBySeller')(escrowId);
                await tx1.wait();
                console.log(`🏦 Seller Confirmation sent: ${tx1.hash}`);

                // Confirm as Admin
                const tx2 = await this.escrowManager.getFunction('confirmEscrowByAdmin')(escrowId);
                await tx2.wait();
                console.log(`👑 Admin Confirmation sent: ${tx2.hash}`);

            } catch (error) {
                console.error('❌ Error processing EscrowInitiated event:', error);
            }
        });

        // 2. Listen for EscrowReleased
        this.escrowManager.on('EscrowReleased', async (escrowId, event) => {
            console.log(`🔓 Escrow Released! ID: ${escrowId}`);
            try {
                const txHash = event.log.transactionHash;
                // Since our Investment table uses txHash of the initiation as a key, 
                // we might need a way to link escrowId to the initial txHash.
                // For now, let's find the pending investment for this user/property pair or escrow ID.
                // Re-fetch escrow data to get the buyer and token
                const escrowData = await this.escrowManager.getFunction('escrows')(escrowId);

                const investment = await Investment.findOne({
                    where: {
                        userAddress: escrowData.buyer,
                        propertyAddress: escrowData.propertyToken,
                        status: 'PENDING'
                    }
                });

                if (investment) {
                    investment.status = 'CONFIRMED';
                    await investment.save();
                    console.log(`✅ Investment status updated to CONFIRMED (ID: ${escrowId})`);
                }
            } catch (error) {
                console.error('❌ Error processing EscrowReleased event:', error);
            }
        });

        // 3. Listen for EscrowRefunded
        this.escrowManager.on('EscrowRefunded', async (escrowId, event) => {
            console.log(`🛑 Escrow Refunded! ID: ${escrowId}`);
            try {
                const escrowData = await this.escrowManager.getFunction('escrows')(escrowId);
                const investment = await Investment.findOne({
                    where: {
                        userAddress: escrowData.buyer,
                        propertyAddress: escrowData.propertyToken,
                        status: 'PENDING'
                    }
                });

                if (investment) {
                    investment.status = 'FAILED';
                    await investment.save();
                    console.log(`✅ Investment status updated to FAILED (ID: ${escrowId})`);
                }
            } catch (error) {
                console.error('❌ Error processing EscrowRefunded event:', error);
            }
        });
    }

    // Utility to sync past events (optional but good for robustness)
    async syncPastEvents() {
        console.log('🔄 Syncing past events...');
        // Implement getLogs if needed for catch-up
    }
}

const service = new BlockchainService();
export default service;
