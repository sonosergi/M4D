import jwt from 'jsonwebtoken';
import fs from 'fs';
import crypto from 'crypto';

export async function validateUserApp(req, res) {
  try {
    // Obtén el token del encabezado de autorización
    const token = req.headers.authorization.split(' ')[1];

    // Ruta al archivo de clave pública
    const publicKeyPath = process.env.PUBLIC_KEY_PATH;

    // Lee la clave pública del archivo
    const publicKeyPem = fs.readFileSync(publicKeyPath, 'utf-8');

    // Crea una clave pública utilizando crypto
    const publicKey = crypto.createPublicKey(publicKeyPem);

    // Verifica la autenticidad del token
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

    // Accede a los valores dentro del token
    const { id: user_id, sessionCookie } = decoded;
    console.log('user_id: ', user_id);
    console.log('sessionCookie: ', sessionCookie);  

    // Hacer algo con user_id y sessionCookie

    return res.status(200).json({ user_id, sessionCookie, message: 'Token verified successfully' });
  } catch (err) {
    console.error('Error verifying token: ', err);
    return res.status(401).json({ message: 'Token verification failed' });
  }
}