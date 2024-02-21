import jwt from 'jsonwebtoken';
import fs from 'fs';
import crypto from 'crypto';

async function validateSessionToken(req, res, next) {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'No authorization header provided' });
    }
    console.log('req.headers', req.headers)

    const token = req.headers.authorization.split(' ')[1];
    console.log('Token:', token);
    const privateKeyPath = process.env.PRIVATE_KEY_PATH;
    const privateKeyPassphrase = process.env.PRIVATE_KEY_PASSPHRASE;
    const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf-8');

    const privateKey = crypto.createPrivateKey({
      key: privateKeyPem,
      passphrase: privateKeyPassphrase,
    });

    const encryptedKeyAndCookie = Buffer.from(token, 'base64');
    const encryptedKey = Uint8Array.prototype.slice.call(encryptedKeyAndCookie, 0, 256);
    const encryptedCookie = Uint8Array.prototype.slice.call(encryptedKeyAndCookie, 256);

    const symmetricKey = crypto.privateDecrypt(privateKey, encryptedKey);

    const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, Buffer.alloc(16, 0));
    const decryptedToken = Buffer.concat([decipher.update(encryptedCookie), decipher.final()]).toString();

    const decoded = jwt.verify(decryptedToken, process.env.SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    next();

  } catch (err) {
    console.error('Error verifying token: ', err);
    return res.status(401).json({ message: 'Token verification failed' });
  }
}

export default validateSessionToken;