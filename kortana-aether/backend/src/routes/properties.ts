import { Router } from 'express';
import Property from '../models/Property.js';
import Investment from '../models/Investment.js';
import YieldPayout from '../models/YieldPayout.js';
import yieldService from '../services/yield.js';
import { fn, col } from 'sequelize';

const router = Router();

// GET /api/properties
router.get('/', async (req, res) => {
    try {
        const properties = await Property.findAll();
        // Parse images JSON for frontend
        const parsedProperties = properties.map(p => {
            const data = p.toJSON();
            try {
                data.images = JSON.parse(data.images);
            } catch (e) {
                data.images = [];
            }
            return data;
        });
        res.json({ properties: parsedProperties, total: parsedProperties.length });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET /api/properties/:id
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (property) {
            const data = property.toJSON();
            try {
                data.images = JSON.parse(data.images);
            } catch (e) {
                data.images = [];
            }
            res.json({ property: data });
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST /api/properties/seed (Internal use or admin)
router.post('/seed', async (req, res) => {
    try {
        const initialProperties = [
            /*
            {
                title: "Modern Villa in Cascais",
                symbol: "MVC",
                address: "0x1692Ec0372a1c95798411b7B6D6B62eEf8230592",
                location: "Cascais, Portugal",
                country: "Portugal",
                valuationUSD: 1200000,
                totalSupply: "10000000000000000000000", // 10k * 10^18
                metadataURI: "ipfs://QmCascaisVilla",
                images: JSON.stringify(['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80']),
                type: 'Residential',
                yield: 6.5,
                goldenVisaEligible: true
            },
            {
                title: "Acropolis View Apartment",
                symbol: "AVA",
                address: "0x58F3359F31d132eF628A1643811Fc778F4b9c789",
                location: "Athens, Greece",
                country: "Greece",
                valuationUSD: 450000,
                totalSupply: "5000000000000000000000", // 5k * 10^18
                metadataURI: "ipfs://QmAthensApt",
                images: JSON.stringify(['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80']),
                type: 'Residential',
                yield: 7.2,
                goldenVisaEligible: true
            },
            */
            {
                title: "Adriatic Coastal Suite",
                symbol: "ACS",
                address: "0x7C4586B9ABD8cfF7A2387aa395b827c22DDf02b2",
                location: "Budva, Montenegro",
                country: "Montenegro",
                valuationUSD: 750000,
                totalSupply: "7500000000000000000000", // 7.5k * 10^18
                metadataURI: "ipfs://QmBudvaSuite",
                images: JSON.stringify(['https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80']),
                type: 'Residential',
                yield: 5.8,
                goldenVisaEligible: false,
                sellerAddress: '0x28e514ce1a0554b83f6d5eeee11b07d0e294d9f9'
            }
        ];

        for (const prop of initialProperties) {
            try {
                const [instance, created] = await Property.findOrCreate({
                    where: { symbol: prop.symbol },
                    defaults: prop
                });
                console.log(`Property ${prop.symbol}: ${created ? 'Created' : 'Already exists'}`);
            } catch (err: any) {
                console.error(`Failed to seed ${prop.symbol}:`, err.message);
            }
        }

        res.json({ message: 'Properties seeded successfully' });
    } catch (error: any) {
        console.error('Error seeding properties:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// POST /api/properties
router.post('/', async (req, res) => {
    try {
        const property = await Property.create(req.body);
        res.status(201).json(property);
    } catch (error: any) {
        console.error('Error creating property:', error);
        res.status(400).json({ error: error.message });
    }
});

// Distribute Yield for a property
router.post('/yield-distribute', async (req, res) => {
    const { propertyAddress } = req.body;
    if (!propertyAddress) {
        return res.status(400).json({ message: 'propertyAddress is required' });
    }

    try {
        // Run in background
        yieldService.distributeYield(propertyAddress);
        res.json({ message: 'Yield distribution started in background' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Distribute Yield for ALL properties
router.post('/yield-distribute-all', async (req, res) => {
    try {
        const properties = await Property.findAll();
        for (const prop of properties) {
            // Run distribution for each property with an address
            if (prop.address) {
                yieldService.distributeYield(prop.address);
            }
        }
        res.json({ message: 'Global yield distribution triggered for all properties' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/properties/admin/stats
router.get('/admin/stats', async (req, res) => {
    try {
        const totalProperties = await Property.count();
        const totalTVL = await Property.sum('valuationUSD');

        const totalInvestors = await Investment.count({
            distinct: true,
            col: 'userAddress'
        });

        const totalYieldData = await YieldPayout.findAll({
            attributes: [
                [fn('SUM', col('amountDinar')), 'totalPaid']
            ],
            where: { status: 'SUCCESS' }
        });

        const totalYieldPaid = totalYieldData[0]?.getDataValue('totalPaid') || '0';

        // Distribution by type
        const typeDistribution = await Property.findAll({
            attributes: ['type', [fn('COUNT', col('id')), 'count']],
            group: ['type']
        });

        res.json({
            stats: {
                totalTVL: totalTVL || 0,
                activeProperties: totalProperties,
                totalInvestors: totalInvestors,
                totalYieldPaid: totalYieldPaid
            },
            typeDistribution
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
