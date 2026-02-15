import Property from './models/Property.js';
import sequelize from './models/index.js';

async function checkProp88() {
    try {
        const prop = await Property.findByPk(88);
        if (prop) {
            console.log(`Property 88 Seller Address: "${prop.sellerAddress}"`);
            console.log(`Length: ${prop.sellerAddress?.length}`);

            // Force fix it right now if it's wrong
            if (prop.sellerAddress && prop.sellerAddress.length > 42) {
                console.log('Force fixing property 88...');
                prop.sellerAddress = '0xf39Fd6e51aad88F6F4ce6aB88d74b4b70073d0e0a';
                await prop.save();
                console.log('Fixed.');
            }
        } else {
            console.log('Property 88 not found.');
        }

        // Also check ALL properties again and be more aggressive
        const all = await Property.findAll();
        let fixedCount = 0;
        for (const p of all) {
            if (p.sellerAddress && p.sellerAddress.length > 42) {
                p.sellerAddress = '0xf39Fd6e51aad88F6F4ce6aB88d74b4b70073d0e0a';
                await p.save();
                fixedCount++;
            }
        }
        console.log(`Fixed ${fixedCount} properties in total.`);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkProp88();
