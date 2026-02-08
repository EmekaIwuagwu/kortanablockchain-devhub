import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

const router = Router();

// POST /api/auth/login - Admin wallet signature verification
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (username !== adminUsername || password !== adminPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const adminAddress = process.env.ADMIN_WALLET_ADDRESS || 'admin';

        // Generate JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: 'JWT Secret not configured' });
        }

        const token = jwt.sign(
            { address: adminAddress.toLowerCase(), role: 'ADMIN' },
            secret,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                address: adminAddress.toLowerCase(),
                role: 'ADMIN'
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
});

// POST /api/auth/verify - Verify JWT token
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { address: string; role: string };
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false, message: 'Invalid token' });
    }
});

export default router;
