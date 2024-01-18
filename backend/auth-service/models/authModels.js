import argon2 from 'argon2';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { AuthDatabase } from '../databases/authDatabases.js'; 

dotenv.config();

const argon2Options = {
  type: argon2[process.env.ARGON2_TYPE],
  timeCost: parseInt(process.env.ARGON2_TIME_COST),
  memoryCost: parseInt(process.env.ARGON2_MEMORY_COST),
  parallelism: parseInt(process.env.ARGON2_PARALLELISM),
};

export class AuthModel {
  static async getUser({ phoneNumber = null, username = null } = {}) {
    if (phoneNumber === null && username === null) {
      throw new Error('Either phoneNumber or username must be provided');
    }
    const [user] = await AuthDatabase.getUser(username, phoneNumber);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async hashPassword(password) {
    if (!password) {
      throw new Error('Password must be provided');
    }
    const salt = crypto.randomBytes(parseInt(process.env.ARGON2_SALT_LENGTH));
    return await argon2.hash(password, { salt, ...argon2Options });
  }

  static async createUser(phoneNumber, username, password) {
    if (!phoneNumber || !username || !password) {
      throw new Error('phoneNumber, username and password must be provided');
    }
    const hashedPassword = await this.hashPassword(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const uniqueId = uuidv4();
    await AuthDatabase.createUser(uniqueId, phoneNumber, username, hashedPassword, verificationCode);
  }

  static async comparePassword(password, hashedPassword) {
    if (!password || !hashedPassword) {
      throw new Error('password and hashedPassword must be provided');
    }
    return await argon2.verify(hashedPassword, password);
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
  //     await createUser(uniqueId, phoneNumber, username, hashedPassword, verificationCode);

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
}
