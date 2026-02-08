import { Router } from 'express';
import Investment from '../models/Investment.js';
import Property from '../models/Property.js';

const router = Router();

// GET /api// Get investments by user address
router.get('/user/:address', async (req, res) => {
    try {
        const investments = await Investment.findAll({
            where: { userAddress: req.params.address },
            include: [{ model: Property, as: 'property' }]
        });
        res.json({ investments });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get yield history by user address
router.get('/payouts/user/:address', async (req, res) => {
    try {
        const { default: YieldPayout } = await import('../models/YieldPayout.js');
        const payouts = await YieldPayout.findAll({
            where: { userAddress: req.params.address },
            include: [{ model: Property, as: 'property' }],
            order: [['distributionDate', 'DESC']]
        });
        res.json({ payouts });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/investments/record (Optional: manual recording if event listener misses or for UI responsiveness)
router.post('/record', async (req, res) => {
    const { userAddress, propertyAddress, tokenAmount, dinarPaid, txHash } = req.body;
    try {
        const investment = await Investment.create({
            userAddress,
            propertyAddress,
            tokenAmount,
            dinarPaid,
            txHash,
            status: 'PENDING'
        });
        res.status(201).json({ investment });
    } catch (error: any) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Transaction already recorded' });
        }
        console.error('Error recording investment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
