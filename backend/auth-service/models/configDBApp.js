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
export const mapdb = new DB(process.env.MAP_DB_URL);

export class DatabaseConfig {
    static async configDB() {
      // Auth service tables
      await this.createTable('users', `CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        phone_number VARCHAR(15) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        verification_code INT
      )`, authdb);

      await this.createTable('profile', `CREATE TABLE IF NOT EXISTS profile (
        user_id UUID PRIMARY KEY
      )`, authdb);

      // Chat service tables
      await this.createTable('users', `CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY,
        username VARCHAR(100) NOT NULL
      )`, chatdb);
  
      // Post service tables
      await this.createTable('users', `CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY,
        username VARCHAR(100) NOT NULL
      )`, postdb);

      // Map service tables
      await this.createTable('users', `CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY,
        username VARCHAR(100) NOT NULL
      )`, mapdb);
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

