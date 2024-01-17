import pgp from 'pg-promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';


dotenv.config();

const db = pgp()(process.env.DATABASE_URL);

export class AuthDatabase {
  static async createTable() {
    try {
      await db.none(`
        CREATE TABLE IF NOT EXISTS auth (
          id UUID PRIMARY KEY,
          phone_number VARCHAR(15) NOT NULL,
          username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          verification_code INT
        );
      `);
      console.log('Table auth created successfully');
    } catch (err) {
      console.error('Error creating auth table', err);
    }
  }

  static async createUser(uniqueId, phoneNumber, username, password, verificationCode) {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.tx(async t => {
      await t.none('INSERT INTO auth(id, phone_number, username, password, verification_code) VALUES($1, $2, $3, $4, $5)', [uniqueId, phoneNumber, username, hashedPassword, verificationCode]);
    });
  }

  static async createUser(uniqueId, phoneNumber, username, hashedPassword, verificationCode) {
    await db.tx(async t => {
      await t.none('INSERT INTO auth(id, phone_number, username, password, verification_code) VALUES($1, $2, $3, $4, $5)', [uniqueId, phoneNumber, username, hashedPassword, verificationCode]);
    });
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async userExists(username, phoneNumber) {
    const query = `
      SELECT COUNT(*) 
      FROM auth 
      WHERE phone_number = $1 OR username = $2
    `;
    const values = [phoneNumber, username];
    const result = await db.one(query, values); // Change this.db.one to db.one
    return result.count > 0;
  }

  static async getUser(username, phoneNumber) {
    const query = `
      SELECT * 
      FROM auth 
      WHERE phone_number = $1 OR username = $2
    `;
    const values = [phoneNumber, username];
    return await db.oneOrNone(query, values);
  }

}


