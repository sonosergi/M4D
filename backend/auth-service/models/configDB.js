//Config database for postgresql with pg-promise
import pgPromise from 'pg-promise';
import dotenv from 'dotenv'

dotenv.config();

class DB {
    constructor(config) {
      this.db = pgPromise()(config);
    }
  
    async query(query, parameters) {
      return this.db.query(query, parameters);
    }
  }

export const chatdb = new DB(process.env.CHAT_DB_URL);
export const authdb = new DB(process.env.AUTH_DB_URL);
export const postdb = new DB(process.env.POST_DB_URL);



export class DatabaseConfig {
    static async configDB() {
        // Chat service tables
        await this.createTable('chat', `CREATE TABLE IF NOT EXISTS chat (
          user_id UUID PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
        )`, chatdb);
    
        // Auth service tables
        await this.createTable('auth', `CREATE TABLE IF NOT EXISTS auth (
          user_id UUID PRIMARY KEY,
          phone_number VARCHAR(15) NOT NULL,
          username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          verification_code INT
        )`, authdb);
    
        // Post service tables
        await this.createTable('posts', `CREATE TABLE IF NOT EXISTS posts (
          user_id UUID PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          username VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`, postdb);
      }

    static async createTable(tableName, query, db) {
        try {
            await db.query(query);
            console.log(`Table ${tableName} created successfully`);
        } catch (err) {
            console.error(`Error creating table ${tableName}`, err);
        }
    }
}

