// @ts-nocheck
import sequelize from './models/index.js';
import Property from './models/Property.js';

const NEW_DATA = [
    { title: 'Modern Villa in Cascais', symbol: 'MVC', address: '0xb18398735D57570394678934157D5Bfb2a3e2B37' },
    { title: 'Acropolis View Apartment', symbol: 'AVA', address: '0x95CeDFdaDc102ca6154A91e24fc5cF2ce8978f1C' },
    { title: 'Adriatic Coastal Suite', symbol: 'ACS', address: '0xD2b11E74C57041C56a808326Edd08524cfBb9D46' }
];

async function fixDb() {
    try {
        console.log('--- FIXING DATABASE PROPERTY ADDRESSES ---');
        const props = await Property.findAll();

        for (const p of props) {
            const data = NEW_DATA.find(d => d.title === p.title);
            if (data) {
                console.log(`Updating ${p.title}: ${p.address} -> ${data.address}`);
                p.address = data.address;
                p.symbol = data.symbol; // Ensure symbol is set too
                await p.save();
            } else {
                console.log(`No match for title: ${p.title}`);
            }
        }

        console.log('--- DATABASE FIXED ---');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixDb();
