import sequelize from './models/index.js';
import Order from './models/Order.js';
import Property from './models/Property.js';

async function seed() {
    try {
        await sequelize.authenticate();

        const properties = await Property.findAll();
        if (properties.length === 0) {
            console.log('No properties found to seed orders.');
            process.exit(1);
        }

        const portugal = properties.find(p => p.country === 'Portugal');
        const greece = properties.find(p => p.country === 'Greece');

        const mockUser1 = '0x1111111111111111111111111111111111111111';
        const mockUser2 = '0x2222222222222222222222222222222222222222';

        if (portugal) {
            await Order.create({
                userAddress: mockUser1,
                propertyAddress: portugal.address,
                type: 'SELL',
                price: 125.40,
                amount: 250,
                status: 'OPEN'
            });
            await Order.create({
                userAddress: mockUser2,
                propertyAddress: portugal.address,
                type: 'BUY',
                price: 124.10,
                amount: 100,
                status: 'OPEN'
            });
        }

        if (greece) {
            await Order.create({
                userAddress: mockUser1,
                propertyAddress: greece.address,
                type: 'SELL',
                price: 132.10,
                amount: 15,
                status: 'OPEN'
            });
        }

        console.log('Seeded Secondary Market orders.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
