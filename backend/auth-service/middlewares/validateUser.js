import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookie from 'cookie';

dotenv.config();

function validateUser(req, res, next) {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.session; 
    console.log('tokenServerSession: ', token);

    if (!token) {
      return res.status(403).json({ message: 'Not authenticated' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      next();
    });
  } catch (err) {
    console.error('Error validating user: ', err);
    return res.status(500).json({ message: 'An error occurred' });
  }
}

export default validateUser;