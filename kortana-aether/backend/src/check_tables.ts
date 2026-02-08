import sequelize from './models/index.js';

async function checkTables() {
    try {
        const [results] = await sequelize.query('SHOW TABLES');
        console.log('--- TABLES START ---');
        results.forEach((row: any) => {
            console.log(Object.values(row)[0]);
        });
        console.log('--- TABLES END ---');
        process.exit(0);
    } catch (error) {
        console.error('Failed to list tables:', error);
        process.exit(1);
    }
}

checkTables();
