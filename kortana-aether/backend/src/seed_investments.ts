import sequelize from './models/index.js';
import Investment from './models/Investment.js';
import User from './models/User.js';

async function seed() {
    try {
        await sequelize.authenticate();
        const userAddress = '0x28c514Ce1a0554B83f6d5EEEE11B07D0e294D9F9';

        // Ensure user exists
        await User.findOrCreate({
            where: { walletAddress: userAddress },
            defaults: { name: 'Sample Investor', role: 'USER' }
        });

        // Property 1 (Portugal): Val €1.2M, Supply 10k tokens -> €120/token
        const portugalAddr = '0x1692Ec0372a1c95798411b7B6D6B62eEf8230592';
        // Property 2 (Greece): Val €650k, Supply 5k tokens -> €130/token
        const greeceAddr = '0x58F3359F31d132eF628A1643811Fc778F4b9c789';

        await Investment.destroy({ where: { userAddress } });

        // Seed with ~4200 tokens for Portugal to be around €504k (Qualified)
        await Investment.create({
            userAddress,
            propertyAddress: portugalAddr,
            tokenAmount: 4200,
            dinarPaid: 504000,
            txHash: '0xmock_tx_portugal_' + Date.now(),
            status: 'CONFIRMED'
        });

        // Seed with ~1500 tokens for Greece to be around €195k (In Progress, threshold €250k)
        await Investment.create({
            userAddress,
            propertyAddress: greeceAddr,
            tokenAmount: 1500,
            dinarPaid: 195000,
            txHash: '0xmock_tx_greece_' + Date.now(),
            status: 'CONFIRMED'
        });

        console.log('Seeded realistic investments for:', userAddress);
        process.exit(0);
    } catch (e) {
        console.error('Seeding failed:', e);
        process.exit(1);
    }
}

seed();
