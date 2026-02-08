import { Router } from 'express';
import Investment from '../models/Investment.js';
import Property from '../models/Property.js';

const router = Router();

// GET /api/investments/user/:address
router.get('/user/:address', async (req, res) => {
    try {
        const investments = await Investment.findAll({
            where: { userAddress: req.params.address },
            include: [{ model: Property, as: 'property' }] // Note: We need to define association
        });
        res.json({ investments });
    } catch (error) {
        console.error('Error fetching user investments:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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
