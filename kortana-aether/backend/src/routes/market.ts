import { Router } from 'express';
import Order from '../models/Order.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

const router = Router();

// GET /api/market/orders
router.get('/orders', async (req, res) => {
    try {
        const { propertyAddress, type, status = 'OPEN' } = req.query;
        const where: any = { status };

        if (propertyAddress) where.propertyAddress = propertyAddress;
        if (type) where.type = type;

        const orders = await Order.findAll({
            where,
            include: [
                { model: Property, as: 'property' },
                { model: User, as: 'user', attributes: ['walletAddress', 'name'] }
            ],
            order: [['price', type === 'BUY' ? 'DESC' : 'ASC']]
        });

        res.json({ orders });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
});

// POST /api/market/orders
router.post('/orders', async (req, res) => {
    const { userAddress, propertyAddress, type, price, amount } = req.body;

    if (!userAddress || !propertyAddress || !type || !price || !amount) {
        return res.status(400).json({ message: 'Missing required order fields' });
    }

    try {
        const order = await Order.create({
            userAddress: userAddress.toLowerCase(),
            propertyAddress: propertyAddress.toLowerCase(),
            type,
            price,
            amount,
            status: 'OPEN'
        });

        res.json({ message: 'Order created successfully', order });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
});

import Investment from '../models/Investment.js';
import sequelize from '../models/index.js';

// ... existing routes ...

// POST /api/market/execute
router.post('/execute', async (req, res) => {
    const { orderId, takerAddress } = req.body;

    if (!orderId || !takerAddress) {
        return res.status(400).json({ message: 'Missing orderId or takerAddress' });
    }

    const transaction = await sequelize.transaction();

    try {
        const order = await Order.findByPk(orderId, { include: [{ model: Property, as: 'property' }], transaction });
        if (!order || order.status !== 'OPEN') {
            await transaction.rollback();
            return res.status(404).json({ message: 'Order not found or already filled' });
        }

        const propertyAddress = order.propertyAddress;
        const makerAddress = order.userAddress;
        const amount = order.amount;
        const price = order.price;

        if (order.type === 'SELL') {
            // Maker is selling tokens, Taker is buying (paying Dinar)
            // 1. Check/Deduct Dinar from Taker (simulated)
            // 2. Add Dinar to Maker (simulated)
            // 3. Move Property Tokens from Maker to Taker

            // Find Maker's investment
            const makerInv = await Investment.findOne({ where: { userAddress: makerAddress, propertyAddress }, transaction });
            if (!makerInv || parseFloat(makerInv.tokenAmount.toString()) < amount) {
                throw new Error('Maker does not have enough tokens');
            }

            // Deduct from Maker
            makerInv.tokenAmount = parseFloat(makerInv.tokenAmount.toString()) - amount;
            await makerInv.save({ transaction });

            // Add to Taker
            const [takerInv, created] = await Investment.findOrCreate({
                where: { userAddress: takerAddress.toLowerCase(), propertyAddress },
                defaults: {
                    tokenAmount: 0,
                    dinarPaid: 0,
                    txHash: `0xex_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    status: 'CONFIRMED'
                },
                transaction
            });
            takerInv.tokenAmount = parseFloat(takerInv.tokenAmount.toString()) + amount;
            takerInv.dinarPaid = parseFloat(takerInv.dinarPaid.toString()) + (amount * price);
            await takerInv.save({ transaction });

        } else {
            // Maker is buying tokens, Taker is selling
            const takerInv = await Investment.findOne({ where: { userAddress: takerAddress.toLowerCase(), propertyAddress }, transaction });
            if (!takerInv || parseFloat(takerInv.tokenAmount.toString()) < amount) {
                throw new Error('Taker does not have enough tokens to sell');
            }

            // Deduct from Taker
            takerInv.tokenAmount = parseFloat(takerInv.tokenAmount.toString()) - amount;
            await takerInv.save({ transaction });

            // Add to Maker
            const [makerInv, created] = await Investment.findOrCreate({
                where: { userAddress: makerAddress, propertyAddress },
                defaults: {
                    tokenAmount: 0,
                    dinarPaid: 0,
                    txHash: `0xex_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    status: 'CONFIRMED'
                },
                transaction
            });
            makerInv.tokenAmount = parseFloat(makerInv.tokenAmount.toString()) + amount;
            makerInv.dinarPaid = parseFloat(makerInv.dinarPaid.toString()) + (amount * price);
            await makerInv.save({ transaction });
        }

        // Finalize Order
        order.status = 'FILLED';
        order.filledAmount = amount;
        await order.save({ transaction });

        await transaction.commit();
        res.json({ message: 'Trade executed successfully', order });

    } catch (error: any) {
        await transaction.rollback();
        console.error('Trade execution failed:', error);
        res.status(500).json({ message: 'Trade execution failed', error: error.message });
    }
});

// GET /api/market/activity
router.get('/activity', async (req, res) => {
    try {
        const activity = await Order.findAll({
            where: { status: 'FILLED' },
            include: [{ model: Property, as: 'property' }],
            limit: 10,
            order: [['updatedAt', 'DESC']]
        });
        res.json({ activity });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch activity', error: error.message });
    }
});

export default router;
