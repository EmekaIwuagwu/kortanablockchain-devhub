import sequelize from './models/index.js';
import Property from './models/Property.js';

async function listProps() {
    try {
        const props = await Property.findAll();
        console.log('--- PROPERTIES START ---');
        props.forEach(p => console.log(JSON.stringify(p.toJSON(), null, 2)));
        console.log('--- PROPERTIES END ---');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listProps();
