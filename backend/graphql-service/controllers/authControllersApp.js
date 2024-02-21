import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';

dotenv.config();

export class AuthController {
  static async requestNoAuth(req, res) {
    try {
      // Generate session cookie
      const noAuthcookie = crypto.randomBytes(64).toString('hex');
      console.log('noAuthcookie: ', noAuthcookie);
  
      // Sign the session cookie with JWT
      const signedCookie = jwt.sign({ session: noAuthcookie }, process.env.SECRET_KEY, {
        expiresIn: '5m',
      });
      console.log('signedCookie: ', signedCookie);
  
      // Load public key from file
      const publicKeyPath = process.env.PUBLIC_PATH;
  
      const publicKeyPem = fs.readFileSync(publicKeyPath, 'utf-8');
  
      // Create a public key object using crypto
      const publicKey = crypto.createPublicKey(publicKeyPem);
  
      // Generate a new random symmetric key for each encryption
      const symmetricKey = crypto.randomBytes(32);
  
      // Encrypt the symmetric key with RSA using the loaded public key
      const encryptedKey = crypto.publicEncrypt(publicKey, symmetricKey);
  
      // Use the symmetric key to encrypt the signed cookie
      const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, Buffer.alloc(16, 0));
      const encryptedCookie = Buffer.concat([cipher.update(signedCookie, 'utf8'), cipher.final()]);
  
      // Concatenate the encrypted key and the encrypted cookie
      const tokenNoAuth = Buffer.concat([encryptedKey, encryptedCookie]).toString('base64');
      console.log('token noAuth: ', tokenNoAuth);
  
      // Send the token as a response header
      res.header('Authorization', `Bearer ${tokenNoAuth}`);
  
      return res.status(200).json({ message: 'No auth request processed successfully' });
    } catch (err) {
      console.error('Error processing no auth request: ', err);
      return res.status(500).json({ message: 'An error occurred' });
    }
  }

  static async requestCookieSession(user) {
    try {
      // Generate session cookie
      const sessionCookie = crypto.randomBytes(64).toString('hex');
      console.log('sessionCookie: ', sessionCookie);
  
      // Get user_id and type from user
      const userId = user.user_id;
      console.log('userId: ', userId);
      const userType = user.type;
      console.log('userType: ', userType);
  
      // Sign the session cookie with JWT
      const signedCookie = jwt.sign({ session: sessionCookie, user_id: userId }, process.env.SECRET_KEY, {
        expiresIn: '1h', // Change this to your desired session duration
      });
      console.log('signedCookie: ', signedCookie);
  
      // Load public key from file
      const publicKeyPath = process.env.PUBLIC_PATH;
      const publicKeyPem = fs.readFileSync(publicKeyPath, 'utf-8');
  
      // Create a public key object using crypto
      const publicKey = crypto.createPublicKey(publicKeyPem);
  
      // Generate a new random symmetric key for each encryption
      const symmetricKey = crypto.randomBytes(32);
  
      // Encrypt the symmetric key with RSA using the loaded public key
      const encryptedKey = crypto.publicEncrypt(publicKey, symmetricKey);
  
      // Use the symmetric key to encrypt the signed cookie
      const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, Buffer.alloc(16, 0));
      const encryptedCookie = Buffer.concat([cipher.update(signedCookie, 'utf8'), cipher.final()]);
  
      // Concatenate the encrypted key and the encrypted cookie
      const sessionToken = Buffer.concat([encryptedKey, encryptedCookie]).toString('base64');
      console.log('sessionToken: ', sessionToken);
  
      // Sign the userType with JWT
      const userTypeToken = jwt.sign({ type: userType }, process.env.SECRET_KEY, {
        expiresIn: '1h', // Change this to your desired session duration
      });
      console.log('userTypeToken: ', userTypeToken);

      const userIdToken = jwt.sign({ user_id: userId }, process.env.SECRET_KEY, {
        expiresIn: '1h', // Change this to your desired session duration
      });
  
      return { sessionToken, userTypeToken, userIdToken };
    } catch (err) {
      console.error('Error processing session request: ', err);
      throw new Error('An error occurred');
    }
  }
}