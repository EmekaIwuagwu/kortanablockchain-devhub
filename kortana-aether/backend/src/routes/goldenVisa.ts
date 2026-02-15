import { Router } from 'express';
import GoldenVisaApplication from '../models/GoldenVisaApplication.js';
import GoldenVisaDeposit from '../models/GoldenVisaDeposit.js';
import Property from '../models/Property.js';

const router = Router();

// GET /api/golden-visa/:address
router.get('/:address', async (req, res) => {
    try {
        const address = req.params.address.toLowerCase();
        // Return the LATEST active/completed application by default
        let application = await GoldenVisaApplication.findOne({
            where: { userAddress: address },
            order: [['createdAt', 'DESC']],
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
                status: 'ELIGIBILITY',
                currentPortugal: 0,
                currentGreece: 0,
                currentSpain: 0,
                currentMontenegro: 0
            });
            // Re-fetch with associations
            application = await GoldenVisaApplication.findOne({
                where: { id: (application as any).id },
                include: [{ model: GoldenVisaDeposit, as: 'goldenVisaDeposits' }] as any
            }) as any;
        }
        res.json({ application });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching application', error: error.message });
    }
});

// GET /api/golden-visa/list/:address
router.get('/list/:address', async (req, res) => {
    try {
        const address = req.params.address.toLowerCase();
        const applications = await GoldenVisaApplication.findAll({
            where: { userAddress: address },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: GoldenVisaDeposit,
                    as: 'goldenVisaDeposits',
                    include: [{ model: Property, as: 'property' }]
                }
            ] as any
        });
        res.json({ applications });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

// POST /api/golden-visa/new
router.post('/new', async (req, res) => {
    try {
        const { userAddress } = req.body;
        if (!userAddress) return res.status(400).json({ message: 'userAddress is required' });

        const application = await GoldenVisaApplication.create({
            userAddress: userAddress.toLowerCase(),
            status: 'ELIGIBILITY',
            currentPortugal: 0,
            currentGreece: 0,
            currentSpain: 0,
            currentMontenegro: 0
        });

        res.status(201).json({ message: 'New application started', application });
    } catch (error: any) {
        res.status(500).json({ message: 'Error starting new application', error: error.message });
    }
});

// POST /api/golden-visa/deposit
router.post('/deposit', async (req, res) => {
    try {
        const { userAddress, propertyId, applicationId, amount, txHash } = req.body;
        if (!userAddress || !propertyId || !amount || !applicationId) {
            return res.status(400).json({ message: 'Missing required fields (including applicationId)' });
        }

        const deposit = await GoldenVisaDeposit.create({
            userAddress: userAddress.toLowerCase(),
            propertyId,
            applicationId,
            amount: parseFloat(amount),
            txHash
        });

        // Optionally update the application total directly if needed, 
        // but we usually calculate it from deposits in the include.

        res.json({ message: 'Deposit recorded', deposit });
    } catch (error: any) {
        res.status(500).json({ message: 'Error recording deposit', error: error.message });
    }
});

// PATCH /api/golden-visa/:address
// Note: This patches the LATEST application for the address to maintain compatibility
router.patch('/:address', async (req, res) => {
    try {
        const application = await GoldenVisaApplication.findOne({
            where: { userAddress: req.params.address.toLowerCase() },
            order: [['createdAt', 'DESC']]
        });
        if (!application) return res.status(404).json({ message: 'Application not found' });

        const updates = req.body;
        console.log(`Updating LATEST Golden Visa status for ${req.params.address}:`, updates.status);
        await application.update(updates);
        res.json({ message: 'Application updated', application });
    } catch (error: any) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Error updating application', error: error.message });
    }
});

// PATCH /api/golden-visa/id/:id
router.patch('/id/:id', async (req, res) => {
    try {
        const application = await GoldenVisaApplication.findByPk(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        await application.update(req.body);
        res.json({ message: 'Application updated', application });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating application', error: error.message });
    }
});

export default router;
