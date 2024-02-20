import dotenv from 'dotenv';
import { DatabaseConfig, authdb, chatdb, postdb, mapdb } from '../models/configDBApp.js';

dotenv.config();

export class AuthDatabase {
  static async init() {
    await DatabaseConfig.configDB();
  }

  static async createUser(uniqueId, type, phoneNumber, username, hashedPassword, verificationCode) {
    // Insert user into authdb
    const authQuery = 'INSERT INTO users(user_id, type, phone_number, username, password, verification_code) VALUES($1, $2, $3, $4, $5, $6)';
    await authdb.query(authQuery, [uniqueId, type, phoneNumber, username, hashedPassword, verificationCode]);

    // Insert user into chatdb
    const chatQuery = 'INSERT INTO users(user_id, username) VALUES($1, $2)';
    await chatdb.query(chatQuery, [uniqueId, username]);

    // Wait for the posts table to be created before trying to insert into it
    const postQuery = 'INSERT INTO users(user_id, username) VALUES($1, $2)';
    await postdb.query(postQuery, [uniqueId, username]);

    // Insert user into mapdb
    const mapQuery = 'INSERT INTO users(user_id, username) VALUES($1, $2)';
    await mapdb.query(mapQuery, [uniqueId, username]);
  }

  static async userExists(username, phoneNumber) {
    const query = `
      SELECT COUNT(*) 
      FROM users 
      WHERE phone_number = $1 OR username = $2
    `;
    const values = [phoneNumber, username];
    const result = await authdb.query(query, values);
    return result[0].count > 0;
  }

  static async getUser(username) {
    const query = `
      SELECT * 
      FROM users 
      WHERE username = $1
    `;
    const values = [username];
    return await authdb.query(query, values);
  }
}