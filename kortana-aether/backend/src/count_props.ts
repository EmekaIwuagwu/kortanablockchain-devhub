import Property from './models/Property.js';
import sequelize from './models/index.js';

async function count() {
    try {
        const c = await Property.count();
        console.log('TOTAL_PROPS:', c);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
count();
