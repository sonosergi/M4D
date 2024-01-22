import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function validateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: 'Not authenticated' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    console.error('Error validating user: ', err);
    return res.status(500).json({ message: 'An error occurred' });
  }
}