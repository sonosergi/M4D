import { AuthModel } from '../models/authModels.js';
import { AuthDatabase } from '../databases/authDatabases.js';

export class AuthController {
  static async login(req, res) {
    try {
      const { username, password, phoneNumber } = req.body;
      const user = await AuthModel.getUser({ username, phoneNumber });
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or phone number' });
      }
      const isValid = await AuthModel.comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      return res.status(200).json({ message: 'Logged in successfully' });
    } catch (err) {
      console.error('Error logging in: ', err);
      return res.status(500).json({ message: 'An error occurred' });
    }
  }

  static async register(req, res) {
    try {
      const { phoneNumber, username, password } = req.body;
      const userExists = await AuthDatabase.userExists(username, phoneNumber);
      if (userExists) {
        return res.status(400).json({ message: 'Username or phone number already in use' });
      }
      await AuthModel.createUser(phoneNumber, username, password); // Use AuthModel.createUser instead of AuthModel.createUserTest
      const userToReturn = { phoneNumber, username };
      return res.status(201).json({ message: 'User created successfully', user: userToReturn });
    } catch (err) {
      console.error('Error registering user: ', err);
      return res.status(500).json({ message: 'An error occurred' });
    }
  }
}