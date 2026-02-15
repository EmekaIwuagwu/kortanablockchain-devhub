import Investment from './models/Investment.js';
import GoldenVisaDeposit from './models/GoldenVisaDeposit.js';
import Property from './models/Property.js';
import sequelize from './models/index.js';

async function check() {
    try {
        const investments = await Investment.findAll();
        const deposits = await GoldenVisaDeposit.findAll();
        const totalProps = await Property.count();

        console.log('TOTAL PROPERTIES IN DB:', totalProps);
        console.log('--- INVESTMENTS ---');
        console.log(JSON.stringify(investments, null, 2));
        console.log('--- DEPOSITS ---');
        console.log(JSON.stringify(deposits, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
