import Investment from './models/Investment.js';
import GoldenVisaDeposit from './models/GoldenVisaDeposit.js';
import Property from './models/Property.js';
import { Op } from 'sequelize';

async function testExclusion(userAddress) {
    const userInvestments = await Investment.findAll({
        where: { userAddress: userAddress },
        attributes: ['propertyAddress']
    });
    const investedAddresses = userInvestments.map(i => i.propertyAddress);

    const userDeposits = await GoldenVisaDeposit.findAll({
        where: { userAddress: userAddress },
        attributes: ['propertyId']
    });
    const depositedIds = userDeposits.map(d => d.propertyId);

    console.log(`Address: ${userAddress}`);
    console.log(`Invested Addresses: ${investedAddresses.length}`);
    console.log(`Deposited IDs: ${depositedIds.length}`);

    const whereClause = {
        [Op.and]: [
            investedAddresses.length > 0 ? { address: { [Op.notIn]: investedAddresses } } : {},
            depositedIds.length > 0 ? { id: { [Op.notIn]: depositedIds } } : {}
        ].filter(c => Object.keys(c).length > 0)
    };

    const count = await Property.count({ where: whereClause });
    console.log(`Visible Properties: ${count}`);
}

async function run() {
    await testExclusion('0x286398ea514Ce1a0554B83f6d5EEEE11B07D0e294D9F9');
    await testExclusion('0x0000000000000000000000000000000000000000');
    process.exit(0);
}
run();
