import pgp from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const dbmap = pgp()(process.env.MAP_DB_URL);

const createTables = async () => {
    try {
        await dbmap.tx(async t => {
            await t.none(`
                CREATE TABLE IF NOT EXISTS location (
                    id SERIAL PRIMARY KEY,
                    user_id UUID REFERENCES users(user_id),
                    lat REAL NOT NULL,
                    lng REAL NOT NULL,
                    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
        });
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables: ', error);
    }
};

createTables();

export class MapDatabase {
    static async query(query, parameters) {
        try {
            const result = await dbmap.any(query, parameters);
            return result;
        } catch (error) {
            console.error('Error executing query: ', error);
            let errorMessage = 'An error occurred while executing the query';
            if (error instanceof pgp.errors.QueryResultError) {
                errorMessage = 'No result returned for the query';
            } else if (error instanceof pgp.errors.QueryFileError) {
                errorMessage = 'Error reading the SQL file';
            }
            throw new Error(errorMessage);
        }
    }
}