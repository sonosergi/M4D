import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

export class AuthModel {
  static async getUser(phoneNumber, username) {
    // Assuming getUser is a method in AuthDatabase
    return await AuthDatabase.getUser(phoneNumber, username);
  }

  static async hashPassword(password) {
    return await argon2.hash(password);
  }

  static async createUserTest(phoneNumber, username, password) {
    // Hash the password
    const hashedPassword = await this.hashPassword(password);
  
    // Generate a verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
  
    // Generate a unique identifier
    const uniqueId = uuidv4();
  
    // Return the necessary data to create a user
    return { uniqueId, phoneNumber, username, hashedPassword, verificationCode };
  }

  static async comparePassword(password, hashedPassword) {
    try {
      return await argon2.verify(hashedPassword, password);
    } catch (err) {
      console.error('Error comparing password');
      throw new Error('Error comparing password');
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
