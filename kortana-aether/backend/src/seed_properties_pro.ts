import Property from './models/Property.js';
import sequelize from './models/index.js';

const countries = [
    { name: 'Portugal', locations: ['Lisbon', 'Porto', 'Algarve', 'Sintra', 'Cascais'] },
    { name: 'Greece', locations: ['Athens', 'Santorini', 'Mykonos', 'Crete', 'Thessaloniki'] },
    { name: 'Montenegro', locations: ['Budva', 'Kotor', 'Tivat', 'Podgorica'] },
    { name: 'Spain', locations: ['Madrid', 'Barcelona', 'Marbella', 'Ibiza', 'Mallorca'] },
    { name: 'Italy', locations: ['Rome', 'Milan', 'Florence', 'Lake Como', 'Tuscany'] },
    { name: 'UAE', locations: ['Dubai', 'Abu Dhabi', 'Ras Al Khaimah'] }
];

const types = ['Residential', 'Commercial', 'High Yield', 'Resort'];
const descriptions = [
    'Luxury villa with stunning views',
    'Modern apartment in the heart of the city',
    'Premium commercial space with high ROI',
    'Exclusive resort property near the coast',
    'Contemporary penthouse with private pool'
];

const images = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687940-4e5a994239b7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dcea464dd?auto=format&fit=crop&w=800&q=80'
];

async function seed() {
    console.log('--- SEEDING 30+ PREMIUM PROPERTIES ---');

    try {
        for (let i = 1; i <= 50; i++) {
            const countryIdx = Math.floor(Math.random() * countries.length);
            const countryObj = countries[countryIdx];
            if (!countryObj) continue;

            const locationIdx = Math.floor(Math.random() * countryObj.locations.length);
            const locationSymbol = countryObj.locations[locationIdx];
            if (!locationSymbol) continue;

            const type = types[Math.floor(Math.random() * types.length)];
            const valuation = Math.floor(Math.random() * 2000000) + 250000;
            const yieldVal = (Math.random() * 8 + 4).toFixed(2);
            const symbol = `PROP-${i}-${Math.random().toString(36).substring(7).toUpperCase()}`;

            // Generate a random mock address to avoid collisions
            const mockAddress = `0x${Math.random().toString(16).substring(2).padEnd(40, '0').substring(0, 40)}`;

            const prop = {
                title: `${descriptions[Math.floor(Math.random() * descriptions.length)]} in ${locationSymbol}`,
                symbol: symbol,
                address: mockAddress,
                location: `${locationSymbol}, ${countryObj.name}`,
                country: countryObj.name,
                valuationUSD: valuation,
                totalSupply: (BigInt(valuation) * BigInt(10 ** 18)).toString(),
                metadataURI: `ipfs://QmProperty${i}`,
                images: JSON.stringify([
                    images[Math.floor(Math.random() * images.length)],
                    images[Math.floor(Math.random() * images.length)]
                ]),
                type: type,
                yield: parseFloat(yieldVal),
                goldenVisaEligible: valuation >= 250000 && (countryObj.name === 'Portugal' || countryObj.name === 'Greece' || countryObj.name === 'Montenegro' || countryObj.name === 'Spain'),
                sellerAddress: '0xD524989d470AdAaf31Ae48416a38f4DF9E0Bbc66' // Verified Demo Receiver
            };

            try {
                const [instance, created] = await Property.findOrCreate({
                    where: { symbol: prop.symbol },
                    defaults: prop
                });

                if (created) {
                    console.log(`[CREATED] ${prop.title} (${prop.country}) - $${prop.valuationUSD}`);
                } else {
                    console.log(`[EXISTS] ${prop.symbol}`);
                }
            } catch (dbErr) {
                console.error(`[ERROR] Failed to seed ${prop.symbol}:`, dbErr.message);
                if (dbErr.parent) console.error('Parent Error:', dbErr.parent.message);
            }
        }

        console.log('--- SEEDING COMPLETE ---');
    } catch (error) {
        console.error('Seeding critical failure:', error);
    } finally {
        process.exit(0);
    }
}

seed();
