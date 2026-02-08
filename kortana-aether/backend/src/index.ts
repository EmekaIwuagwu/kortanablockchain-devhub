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
import messagesRoutes from './routes/messages.js';
import { connectDB } from './models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import blockchainService from './services/blockchain.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database Connection
connectDB().then(() => {
    blockchainService.startListening();
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
app.use('/api/messages', messagesRoutes);

// Basic route
app.get('/health', (req, res) => {
    res.json({ status: 'Aether Backend is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
