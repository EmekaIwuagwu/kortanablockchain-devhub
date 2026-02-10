import { Router } from 'express';
import User from '../models/User.js';
import Investment from '../models/Investment.js';
import Document from '../models/Document.js';
import GoldenVisaApplication from '../models/GoldenVisaApplication.js';
import { ethers } from 'ethers';

const router = Router();

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            include: [
                { model: Investment, as: 'investments' },
                { model: Document, as: 'documents' },
                { model: GoldenVisaApplication, as: 'goldenVisa' }
            ]
        });

        // Enhance with stats
        const enhancedUsers = users.map(user => {
            const u = user.toJSON();
            // Calculate total invested logic could go here if stored, or just count
            u.totalInvested = u.investments?.length || 0; // Simple count for now
            return u;
        });

        res.json({ users: enhancedUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/users/register (Called by frontend on connect)
router.post('/register', async (req, res) => {
    const { walletAddress } = req.body;
    if (!walletAddress) {
        return res.status(400).json({ message: 'Wallet address required' });
    }

    try {
        const [user, created] = await User.findOrCreate({
            where: { walletAddress: walletAddress.toLowerCase() },
            defaults: {
                kycStatus: 'PENDING',
                role: 'USER'
            }
        });
        res.json({ user, created });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PATCH /api/users/:address/kyc
router.patch('/:address/kyc', async (req, res) => {
    const { status } = req.body;
    try {
        const user = await User.findOne({ where: { walletAddress: req.params.address.toLowerCase() } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.kycStatus = status;
        await user.save();

        res.json({ message: 'KYC Status updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update KYC' });
    }
});

// GET /api/users/:address
router.get('/:address', async (req, res) => {
    try {
        const user = await User.findOne({
            where: { walletAddress: req.params.address.toLowerCase() }
        });
        if (!user) {
            const adminAddress = (process.env.ADMIN_WALLET_ADDRESS || '0x28e514ce1a0554b83f6d5eeee11b07d0e294d9f9').toLowerCase();
            const isAdmin = req.params.address.toLowerCase() === adminAddress;
            return res.json({
                user: {
                    walletAddress: req.params.address.toLowerCase(),
                    name: isAdmin ? 'Platform Admin' : 'User',
                    role: isAdmin ? 'ADMIN' : 'USER'
                }
            });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/users/faucet (Testnet Faucet)
router.post('/faucet', async (req, res) => {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ message: 'Address required' });

    console.log(`[Faucet] Processing request for: ${walletAddress}`);

    try {
        const rpcUrl = process.env.KORTANA_RPC_URL || 'https://poseidon-rpc.kortana.worchsester.xyz/';
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        if (!process.env.ADMIN_PRIVATE_KEY) {
            throw new Error('ADMIN_PRIVATE_KEY is not defined in .env');
        }

        const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

        // 1. Send 1000 DNR
        console.log(`[Faucet] Sending 1000 DNR...`);
        const tx = await wallet.sendTransaction({
            to: walletAddress,
            value: ethers.parseEther("1000"),
            gasLimit: 21000 // Standard ETH transfer gas
        });
        await tx.wait();
        console.log(`[Faucet] DNR sent: ${tx.hash}`);

        res.json({
            message: 'Airdrop Success! 1000 DNR sent to your wallet.',
            dnrHash: tx.hash
        });
    } catch (error: any) {
        console.error('[Faucet] Error:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

export default router;
