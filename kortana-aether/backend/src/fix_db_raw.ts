// @ts-nocheck
import sequelize from './models/index.js';

async function fixDbRaw() {
    try {
        console.log('--- FIXING DATABASE VIA RAW SQL ---');

        const updates = [
            { id: 1, address: '0xb18398735D57570394678934157D5Bfb2a3e2B37', symbol: 'MVC' },
            { id: 2, address: '0x95CeDFdaDc102ca6154A91e24fc5cF2ce8978f1C', symbol: 'AVA' },
            { id: 3, address: '0xD2b11E74C57041C56a808326Edd08524cfBb9D46', symbol: 'ACS' }
        ];

        for (const up of updates) {
            console.log(`Updating ID ${up.id} to ${up.address}...`);
            await sequelize.query(
                `UPDATE properties SET address = '${up.address}', symbol = '${up.symbol}' WHERE id = ${up.id}`
            );
        }

        console.log('--- VERIFYING ---');
        const [results] = await sequelize.query('SELECT id, symbol, address FROM properties');
        console.log(JSON.stringify(results, null, 2));

        console.log('--- DONE ---');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixDbRaw();
