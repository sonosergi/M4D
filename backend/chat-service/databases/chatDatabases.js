import pgp from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const chatdb = pgp()(process.env.CHAT_DB_URL);

const createTables = async () => {
    try {
        await chatdb.none(`
            CREATE TABLE IF NOT EXISTS users (
                user_id UUID PRIMARY KEY,
                username VARCHAR(100) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS chat_rooms (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                user_id UUID REFERENCES users(user_id)
            );
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                username VARCHAR(100) NOT NULL,
                chat_room_id INT REFERENCES chat_rooms(id)
            );
            CREATE TABLE IF NOT EXISTS private_chats (
                id SERIAL PRIMARY KEY,
                user1 UUID REFERENCES users(user_id),
                user2 UUID REFERENCES users(user_id)
            );
        `);
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables: ', error);
    }
};

createTables();

export class ChatDatabase {
    static async query(query, parameters) {
        try {
            const result = await chatdb.any(query, parameters);
            return result;
        } catch (error) {
            console.error('Error executing query: ', error);
            throw error;
        }
    }
}