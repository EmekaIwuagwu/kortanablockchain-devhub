// @ts-nocheck
import sequelize from './models/index.js';
import Property from './models/Property.js';

async function fixDb() {
    try {
        console.log('--- FIXING DATABASE PROPERTY ADDRESSES BY ID ---');

        // ID 1: MVC
        const p1 = await Property.findByPk(1);
        if (p1) {
            p1.address = '0xb18398735D57570394678934157D5Bfb2a3e2B37';
            p1.symbol = 'MVC';
            await p1.save();
            console.log('Fixed Property 1 (MVC)');
        }

        // ID 2: AVA
        const p2 = await Property.findByPk(2);
        if (p2) {
            p2.address = '0x95CeDFdaDc102ca6154A91e24fc5cF2ce8978f1C';
            p2.symbol = 'AVA';
            await p2.save();
            console.log('Fixed Property 2 (AVA)');
        }

        // Add 3 if it exists or create it?
        // Let's just create 3 if it's missing but in contracts.json
        const p3 = await Property.findByPk(3);
        if (p3) {
            p3.address = '0xD2b11E74C57041C56a808326Edd08524cfBb9D46';
            p3.symbol = 'ACS';
            await p3.save();
            console.log('Fixed Property 3 (ACS)');
        }

        console.log('--- DATABASE FIXED ---');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixDb();
