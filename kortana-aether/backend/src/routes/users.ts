import { Router } from 'express';
import User from '../models/User.js';
import Investment from '../models/Investment.js';

const router = Router();

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{
                model: Investment,
                as: 'investments'
            }]
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

export default router;
