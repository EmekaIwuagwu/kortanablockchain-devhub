import Property from './models/Property.js';
import sequelize from './models/index.js';

async function debug() {
    try {
        const properties = await Property.findAll({ limit: 5 });
        properties.forEach(p => {
            console.log(`ID: ${p.id}, Symbol: ${p.symbol}, Seller: "${p.sellerAddress}", Len: ${p.sellerAddress?.length}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

debug();
