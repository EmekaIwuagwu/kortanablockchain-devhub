import { Router } from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

const router = Router();

// GET /api/messages - Get user's conversations
router.get('/', async (req, res) => {
    const { address } = req.query;
    if (!address) {
        return res.status(400).json({ message: 'User address required' });
    }

    try {
        // Find all unique addresses the user has chatted with
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderAddress: (address as string).toLowerCase() },
                    { receiverAddress: (address as string).toLowerCase() }
                ]
            },
            order: [['createdAt', 'DESC']]
        });

        // Group by conversation partner
        const conversations: any = {};
        messages.forEach((msg: any) => {
            const partner = msg.senderAddress === (address as string).toLowerCase()
                ? msg.receiverAddress
                : msg.senderAddress;

            if (!conversations[partner]) {
                conversations[partner] = {
                    partner,
                    lastMessage: msg.content,
                    time: msg.createdAt,
                    unreadCount: msg.receiverAddress === (address as string).toLowerCase() && !msg.isRead ? 1 : 0
                };
            } else if (msg.receiverAddress === (address as string).toLowerCase() && !msg.isRead) {
                conversations[partner].unreadCount++;
            }
        });

        // Fetch user metadata for partners to show roles (Buyer/Seller/Admin)
        const partnerAddresses = Object.keys(conversations);
        const users = await User.findAll({
            where: {
                walletAddress: {
                    [Op.in]: partnerAddresses
                }
            }
        });

        const userMap = users.reduce((acc: any, user: any) => {
            acc[user.walletAddress.toLowerCase()] = {
                name: user.name,
                role: user.role
            };
            return acc;
        }, {});

        const conversationList = Object.values(conversations).map((conv: any) => ({
            ...conv,
            partnerName: userMap[conv.partner.toLowerCase()]?.name || 'Anonymous User',
            partnerRole: userMap[conv.partner.toLowerCase()]?.role || 'USER'
        }));

        res.json({ conversations: conversationList });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
    }
});

// GET /api/messages/:partner - Get chat history
router.get('/:partner', async (req, res) => {
    const { userAddress } = req.query;
    const { partner } = req.params;

    if (!userAddress || !partner) {
        return res.status(400).json({ message: 'Addresses required' });
    }

    try {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    {
                        senderAddress: (userAddress as string).toLowerCase(),
                        receiverAddress: partner.toLowerCase()
                    },
                    {
                        senderAddress: partner.toLowerCase(),
                        receiverAddress: (userAddress as string).toLowerCase()
                    }
                ]
            },
            order: [['createdAt', 'ASC']]
        });

        // Mark incoming messages as read
        await Message.update(
            { isRead: true },
            {
                where: {
                    senderAddress: partner.toLowerCase(),
                    receiverAddress: (userAddress as string).toLowerCase(),
                    isRead: false
                }
            }
        );

        res.json({ messages });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
    }
});

// POST /api/messages - Send message
router.post('/', async (req, res) => {
    const { senderAddress, receiverAddress, content } = req.body;

    if (!senderAddress || !receiverAddress || !content) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    const sAddress = senderAddress.toLowerCase();
    const rAddress = receiverAddress.toLowerCase();
    const adminAddress = (process.env.ADMIN_WALLET_ADDRESS || '0x28e514ce1a0554b83f6d5eeee11b07d0e294d9f9').toLowerCase();

    try {
        // Ensure both users exist in the registry to satisfy foreign key constraints
        await User.findOrCreate({
            where: { walletAddress: sAddress },
            defaults: {
                walletAddress: sAddress,
                name: sAddress === adminAddress ? 'Platform Admin' : 'Investor',
                role: sAddress === adminAddress ? 'ADMIN' : 'USER'
            }
        });

        await User.findOrCreate({
            where: { walletAddress: rAddress },
            defaults: {
                walletAddress: rAddress,
                name: rAddress === adminAddress ? 'Platform Admin' : 'Counterparty',
                role: rAddress === adminAddress ? 'ADMIN' : 'USER'
            }
        });

        const message = await Message.create({
            senderAddress: sAddress,
            receiverAddress: rAddress,
            content,
            isRead: false
        });
        res.json({ message });
    } catch (error: any) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
});

// GET /api/messages/unread-count
router.get('/unread-count', async (req, res) => {
    const { address } = req.query;
    if (!address) {
        return res.status(400).json({ message: 'Address required' });
    }

    try {
        const count = await Message.count({
            where: {
                receiverAddress: (address as string).toLowerCase(),
                isRead: false
            }
        });
        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
    }
});

export default router;
