import jwt from 'jsonwebtoken';
import fs from 'fs';
import crypto from 'crypto';

async function validateUserApp(req, res, next){
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'No authorization header provided' });
    }

    // Obtén el token del encabezado de autorización
    const token = req.headers.authorization.split(' ')[1];
    console.log(req.headers.authorization);
    console.log('tokenvalidateUser: ', token);

    // Ruta al archivo de clave privada
    const privateKeyPath = process.env.PRIVATE_KEY_PATH;
    const privateKeyPassphrase = process.env.PRIVATE_KEY_PASSPHRASE;

    // Lee la clave privada del archivo
    const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf-8');

    // Crea una clave privada utilizando crypto
    const privateKey = crypto.createPrivateKey({
      key: privateKeyPem,
      passphrase: privateKeyPassphrase,
    });

    // Divide el token en la clave encriptada y los datos encriptados
    const encryptedKeyAndCookie = Buffer.from(token, 'base64');
    const encryptedKey = Uint8Array.prototype.slice.call(encryptedKeyAndCookie, 0, 256);
    const encryptedCookie = Uint8Array.prototype.slice.call(encryptedKeyAndCookie, 256);

    // Desencripta la clave simétrica con la clave privada
    const symmetricKey = crypto.privateDecrypt(privateKey, encryptedKey);

    // Usa la clave simétrica para desencriptar los datos
    const decipher = crypto.createDecipheriv('aes-256-cbc', symmetricKey, Buffer.alloc(16, 0));
    const decryptedToken = Buffer.concat([decipher.update(encryptedCookie), decipher.final()]).toString();

    console.log('decryptedToken: ', decryptedToken);  // Imprime el token desencriptado

    // Verifica la autenticidad del token desencriptado
    const decoded = jwt.verify(decryptedToken, process.env.SECRET_KEY);

    // Accede a los valores dentro del token
    const { session } = decoded;
    console.log('session: ', session);

    next();
  } catch (err) {
    console.error('Error verifying token: ', err);
    return res.status(401).json({ message: 'Token verification failed' });
  }
}

export default validateUserApp;