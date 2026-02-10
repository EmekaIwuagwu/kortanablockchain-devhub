import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import propertiesRoutes from './routes/properties.js';
import investmentsRoutes from './routes/investments.js';
import usersRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/uploads.js';
import transactionRoutes from './routes/transactions.js';
import marketRoutes from './routes/market.js';
import goldenVisaRoutes from './routes/goldenVisa.js';
import { connectDB } from './models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import blockchainService from './services/blockchain.js';
import cron from 'node-cron';
import yieldService from './services/yield.js';
import Property from './models/Property.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database Connection
connectDB().then(() => {
    blockchainService.startListening();

    // Automated Yield Distribution: Every 1st of the month at midnight
    cron.schedule('0 0 1 * *', async () => {
        console.log('⏳ Running automated monthly yield distribution...');
        try {
            const properties = await Property.findAll();
            for (const prop of properties) {
                if (prop.address) {
                    await yieldService.distributeYield(prop.address);
                }
            }
            console.log('✅ Automated yield distribution completed.');
        } catch (error) {
            console.error('❌ Automated yield distribution failed:', error);
        }
    });
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/golden-visa', goldenVisaRoutes);

// Basic route
app.get('/health', (req, res) => {
    res.json({ status: 'Aether Backend is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
