import Property from './models/Property.js';
import sequelize from './models/index.js';

async function globalFix() {
    const targetAddress = '0xD524989d470AdAaf31Ae48416a38f4DF9E0Bbc66';
    try {
        const count = await Property.update(
            { sellerAddress: targetAddress },
            { where: {} }
        );
        console.log(`Updated ${count} properties with seller address: ${targetAddress}`);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
globalFix();
