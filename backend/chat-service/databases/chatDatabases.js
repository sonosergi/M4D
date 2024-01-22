import pgp from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const chatdb = pgp()(process.env.CHAT_DB_URL);

const createTables = async () => {
    try {
        await chatdb.tx(async t => {
            await t.none(`
                CREATE TABLE IF NOT EXISTS chat_rooms (
                    id SERIAL PRIMARY KEY,
                    user_id UUID REFERENCES users(user_id),
                    room_name VARCHAR(100) NOT NULL UNIQUE,
                    location_id INT NOT NULL UNIQUE
                );
                CREATE TABLE IF NOT EXISTS room_messages (
                    id SERIAL PRIMARY KEY,
                    content TEXT NOT NULL,
                    user_id UUID REFERENCES users(user_id),
                    chat_room_id INT REFERENCES chat_rooms(id),
                    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS private_chats (
                    id SERIAL PRIMARY KEY,
                    user1_id UUID REFERENCES users(user_id),
                    user2_id UUID REFERENCES users(user_id)
                );
                CREATE TABLE IF NOT EXISTS private_messages (
                    id SERIAL PRIMARY KEY,
                    content TEXT NOT NULL,
                    user_id UUID REFERENCES users(user_id),
                    private_chat_id INT REFERENCES private_chats(id),
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

export class ChatDatabase {
    static async query(query, parameters) {
        try {
            const result = await chatdb.tx(async t => {
                return await t.any(query, parameters);
            });
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