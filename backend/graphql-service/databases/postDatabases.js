import pgp from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const postdb = pgp()(process.env.POST_DB_URL);

const createTables = async () => {
    try {
        await postdb.tx(async t => {
            await t.none(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(user_id),
                room_name VARCHAR(100) NOT NULL UNIQUE,
                description VARCHAR(1000) NOT NULL,
                stars INT NOT NULL DEFAULT 0,
                lat REAL NOT NULL,
                lng REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS publications (
                id SERIAL PRIMARY KEY,
                post_id INT NOT NULL REFERENCES posts(id),
                title VARCHAR(100) NOT NULL,
                description VARCHAR(1000) NOT NULL,
                image_url VARCHAR(1000),
                user_id UUID NOT NULL,
                time TIMESTAMP NOT NULL,
                likes INT NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                publication_id INT NOT NULL REFERENCES publications(id),
                user_id UUID NOT NULL,
                text VARCHAR(1000) NOT NULL,
                time TIMESTAMP NOT NULL
            );
            CREATE TABLE IF NOT EXISTS stars (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(user_id),
                post_id INT NOT NULL REFERENCES posts(id),
                time TIMESTAMP NOT NULL
            );
            CREATE TABLE IF NOT EXISTS likes (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(user_id),
                publication_id INT NOT NULL REFERENCES publications(id),
                time TIMESTAMP NOT NULL
            );
        `);
        });
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables: ', error);
    }
};

createTables();

export class PostDatabase {
    static async query(query, parameters) {
        try {
            const result = await postdb.tx(async t => {
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

    static async getAllPosts() {
        const query = 'SELECT * FROM posts';
        return await this.query(query);
    }
}