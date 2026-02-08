import { Router } from 'express';
import Investment from '../models/Investment.js';
import YieldPayout from '../models/YieldPayout.js';
import Property from '../models/Property.js';

const router = Router();

// GET /api/transactions
router.get('/', async (req, res) => {
    try {
        const investments = await Investment.findAll({
            include: [{ model: Property, as: 'property' }],
            order: [['createdAt', 'DESC']]
        });

        const payouts = await YieldPayout.findAll({
            include: [{ model: Property, as: 'property' }],
            order: [['createdAt', 'DESC']]
        });

        // Combine and sort
        const transactions = [
            ...investments.map((i: any) => ({
                id: i.id,
                type: 'INVESTMENT',
                amount: i.dinarPaid,
                tokenAmount: i.tokenAmount,
                property: i.property?.title,
                wallet: i.userAddress,
                txHash: i.txHash,
                date: i.createdAt
            })),
            ...payouts.map((p: any) => ({
                id: p.id,
                type: 'YIELD_PAYOUT',
                amount: p.amountDinar,
                property: p.property?.title,
                txHash: p.txHash,
                date: p.distributionDate || p.createdAt
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json({ transactions });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }
});

export default router;
