import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('Starting migration to drop old customer foreign key constraints...');

        // Drop old foreign key constraints that reference customers table
        const constraints = [
            'ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_customers_id_fk',
            'ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_customers_id_fk',
            'ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_customer_id_customers_id_fk',
        ];

        for (const sql of constraints) {
            console.log(`Executing: ${sql}`);
            await client.query(sql);
        }

        // Drop old customer_id columns if they exist
        const dropColumns = [
            'ALTER TABLE invoices DROP COLUMN IF EXISTS customer_id',
            'ALTER TABLE orders DROP COLUMN IF EXISTS customer_id',
            'ALTER TABLE quotations DROP COLUMN IF EXISTS customer_id',
        ];

        for (const sql of dropColumns) {
            console.log(`Executing: ${sql}`);
            await client.query(sql);
        }

        // Drop customers table if it exists
        console.log('Dropping customers table...');
        await client.query('DROP TABLE IF EXISTS customers CASCADE');

        console.log('Migration completed successfully!');
        console.log('Now run: npx drizzle-kit push');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
};

migrate();
