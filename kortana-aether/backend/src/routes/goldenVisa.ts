import { Router } from 'express';
import GoldenVisaApplication from '../models/GoldenVisaApplication.js';
import GoldenVisaDeposit from '../models/GoldenVisaDeposit.js';
import Property from '../models/Property.js';

const router = Router();

// GET /api/golden-visa/:address
router.get('/:address', async (req, res) => {
    try {
        const address = req.params.address.toLowerCase();
        let application = await GoldenVisaApplication.findOne({
            where: { userAddress: address },
            include: [
                {
                    model: GoldenVisaDeposit,
                    as: 'goldenVisaDeposits',
                    include: [{ model: Property, as: 'property' }]
                }
            ] as any
        });

        if (!application) {
            application = await GoldenVisaApplication.create({
                userAddress: address,
                status: 'ELIGIBILITY'
            });
            // Re-fetch with associations
            application = await GoldenVisaApplication.findOne({
                where: { userAddress: address },
                include: [{ model: GoldenVisaDeposit, as: 'goldenVisaDeposits' }] as any
            }) as any;
        }
        res.json({ application });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching application', error: error.message });
    }
});

// POST /api/golden-visa/deposit
router.post('/deposit', async (req, res) => {
    try {
        const { userAddress, propertyId, amount, txHash } = req.body;
        if (!userAddress || !propertyId || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const deposit = await GoldenVisaDeposit.create({
            userAddress: userAddress.toLowerCase(),
            propertyId,
            amount,
            txHash
        });

        res.json({ message: 'Deposit recorded', deposit });
    } catch (error: any) {
        res.status(500).json({ message: 'Error recording deposit', error: error.message });
    }
});

// PATCH /api/golden-visa/:address
router.patch('/:address', async (req, res) => {
    try {
        const application = await GoldenVisaApplication.findOne({
            where: { userAddress: req.params.address.toLowerCase() }
        });
        if (!application) return res.status(404).json({ message: 'Application not found' });

        const updates = req.body;
        console.log(`Updating Golden Visa status for ${req.params.address}:`, updates.status);
        await application.update(updates);
        res.json({ message: 'Application updated', application });
    } catch (error: any) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Error updating application', error: error.message });
    }
});

export default router;
