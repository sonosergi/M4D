import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookie from 'cookie';

dotenv.config();

export function validateUser(req, res, next) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.token;
    console.log('validateUser token: ', token);

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