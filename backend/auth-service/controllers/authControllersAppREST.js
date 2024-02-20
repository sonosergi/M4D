import { AuthModel } from '../models/authModelsApp.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
import { AuthDatabase } from '../databases/authDatabasesApp.js';

dotenv.config();

export class AuthController {
  static async requestNoAuth(req, res) {
    try {
      // Generate session cookie
      const noAuthcookie = crypto.randomBytes(64).toString('hex');
  
      // Set session cookie as HttpOnly, SameSite=Strict
      res.cookie('session', noAuthcookie, { httpOnly: true, secure: true, sameSite: 'strict' });
  
      // Load private key from file
      const privateKeyPath = process.env.PRIVATE_KEY_PATH;
      const privateKeyPassphrase = process.env.PRIVATE_KEY_PASSPHRASE;
  
      const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf-8');
  
      // Create a private key object using crypto
      const privateKey = crypto.createPrivateKey({
        key: privateKeyPem,
        passphrase: privateKeyPassphrase,
      });
  
      // Generate JWT with RSA encryption using the loaded private key
      const tokenNoAuth = jwt.sign({ noAuthcookie }, privateKey, {
        algorithm: 'RS256',
        expiresIn: '5m',
      });
      console.log('token noATuth: ', tokenNoAuth);
  
      // Send the token as a response header
      res.header('Authorization', `Bearer ${tokenNoAuth}`);
  
      return res.status(200).json({ message: 'No auth request processed successfully' });
    } catch (err) {
      console.error('Error processing no auth request: ', err);
      return res.status(500).json({ message: 'An error occurred' });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await AuthModel.getUser({ username });

      if (!user) {
        return res.status(401).json({ message: 'Invalid username' });
      }

      const isValid = await AuthModel.comparePassword(password, user.password);

      if (!isValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Generate session cookie
      const sessionCookie = crypto.randomBytes(64).toString('hex');

      // Set session cookie as HttpOnly, SameSite=Strict
      res.cookie('session', sessionCookie, { httpOnly: true, secure: true, sameSite: 'strict' });

      // Load private key from file
      const privateKeyPath = process.env.PRIVATE_KEY_PATH;
      const privateKeyPassphrase = process.env.PRIVATE_KEY_PASSPHRASE;

      const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf-8');

      // Create a private key object using crypto
      const privateKeyAuth = crypto.createPrivateKey({
        key: privateKeyPem,
        passphrase: privateKeyPassphrase,
      });

      // Generate JWT with RSA encryption using the loaded private key
      const token = jwt.sign({ id: user.user_id, sessionCookie }, privateKeyAuth, {
        algorithm: 'RS256',
        expiresIn: '1h',
      });
      console.log('token generado: ', token);

      // Generate JWT with user type
      const userTypeToken = jwt.sign({ type: user.type }, process.env.SECRET_KEY, {
        expiresIn: '1h',
      });

      // Send the tokens as a response header
      res.header('Authorization', `Bearer ${token}`);
      res.header('User-Type', `Bearer ${userTypeToken}`);
      console.log('token enviado: ', token);

      return res.status(200).json({ message: 'Logged in successfully', userTypeToken });
    } catch (err) {
      console.error('Error logging in: ', err);
      return res.status(500).json({ message: 'An error occurred' });
    }
  }

  static async register(req, res) {
    try {
      await AuthDatabase.init();
  
      const { type, phoneNumber, username, password } = req.body;
      console.log('type: ', type);
      const userExists = await AuthDatabase.userExists(username, phoneNumber);
      if (userExists) {
        return res.status(400).json({ message: 'Username or phone number already in use' });
      }
      await AuthModel.createUser(type, phoneNumber, username, password); 
      const userToReturn = { phoneNumber, username };
      
      return res.status(200).json(userToReturn);
    } catch (err) {
      console.error('Error registering user: ', err);
      return res.status(500).json({ message: 'An error occurred' });
    }
  }
}