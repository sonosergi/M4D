import pgp from 'pg-promise';
import argon2 from 'argon2';
import dotenv from 'dotenv';
//import twilio from 'twilio';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const db = pgp()(process.env.DATABASE_URL);
//const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export class AuthModel {
  static async getUser(phoneNumber, username) {
    try {
      return await db.oneOrNone('SELECT * FROM users WHERE phone_number = $1 OR username = $2', [phoneNumber, username]);
    } catch (err) {
      console.error('Error getting user');
      throw new Error('Error getting user');
    }
  }

  // static async createUser(phoneNumber, username, password) {
  //   try {
  //     // Validate phoneNumber, username and password
  //     if (!phoneNumber || !username || !password) {
  //       throw new Error('Phone number, username and password are required');
  //     }
  //     if (password.length < 8) {
  //       throw new Error('Password must be at least 8 characters long');
  //     }

  //     // Check if user already exists
  //     const existingUser = await this.getUser(phoneNumber, username);
  //     if (existingUser) {
  //       throw new Error('User with this phone number or username already exists');
  //     }

  //     // Hash the password
  //     const hashedPassword = await argon2.hash(password);

  //     // Generate a verification code
  //     const verificationCode = Math.floor(100000 + Math.random() * 900000);

  //     // Generate a unique identifier
  //     const uniqueId = uuidv4();

  //     // Store the user in the database with a verification code and unique identifier
  //     await db.tx(async t => {
  //       await t.none('INSERT INTO users(id, phone_number, username, password, verification_code) VALUES($1, $2, $3, $4, $5)', [uniqueId, phoneNumber, username, hashedPassword, verificationCode]);
  //     });

  //     // Send a verification text message
  //     await twilioClient.messages.create({
  //       body: `Your verification code is ${verificationCode}`,
  //       from: process.env.TWILIO_PHONE_NUMBER,
  //       to: phoneNumber
  //     });

  //     return { message: 'A verification code has been sent to ' + phoneNumber + '.' };
  //   } catch (err) {
  //     console.error('Error creating user');
  //     throw new Error('Error creating user');
  //   }
  // }

  static async createUserTest(phoneNumber, username, password) {
    try {
      // Validate phoneNumber, username and password
      if (!phoneNumber || !username || !password) {
        throw new Error('Phone number, username and password are required');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Check if user already exists
      const existingUser = await this.getUser(phoneNumber, username);
      if (existingUser) {
        throw new Error('User with this phone number or username already exists');
      }

      // Hash the password
      const hashedPassword = await argon2.hash(password);

      // Generate a verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      // Generate a unique identifier
      const uniqueId = uuidv4();

      // Store the user in the database with a verification code and unique identifier
      await db.tx(async t => {
        await t.none('INSERT INTO users(id, phone_number, username, password, verification_code) VALUES($1, $2, $3, $4, $5)', [uniqueId, phoneNumber, username, hashedPassword, verificationCode]);
      });

      // Return a success message
      return { message: 'User created successfully. Verification code is ' + verificationCode + '.' };
    } catch (err) {
      console.error('Error creating user');
      throw new Error('Error creating user');
    }
  }

  static async comparePassword(password, hashedPassword) {
    try {
      return await argon2.verify(hashedPassword, password);
    } catch (err) {
      console.error('Error comparing password');
      throw new Error('Error comparing password');
    }
  }
}

export default AuthModel;