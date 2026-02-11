// @ts-nocheck
import sequelize from './models/index.js';

async function checkSchema() {
    try {
        const [results] = await sequelize.query('DESCRIBE properties');
        console.log(JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (e) {
        // Try information_schema if DESCRIBE fails (MySQL/Postgres)
        try {
            const [results] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'properties'");
            console.log(JSON.stringify(results, null, 2));
            process.exit(0);
        } catch (e2) {
            console.error(e2);
            process.exit(1);
        }
    }
}

checkSchema();
