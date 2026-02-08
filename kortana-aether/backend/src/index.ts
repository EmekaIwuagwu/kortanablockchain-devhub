import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import propertiesRoutes from './routes/properties.js';
import investmentsRoutes from './routes/investments.js';
import { connectDB } from './models/index.js';
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

// Routes
app.use('/api/properties', propertiesRoutes);
app.use('/api/investments', investmentsRoutes);

// Basic route
app.get('/health', (req, res) => {
    res.json({ status: 'Aether Backend is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
