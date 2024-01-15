import { AuthModel } from '../models/auth.js';

export class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await AuthModel.getUser(username);
      const isValid = await AuthModel.comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      // Here you might want to generate and return a JWT or similar
      return res.status(200).json({ message: 'Logged in successfully', user });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  static async register(req, res) {
    try {
      const { username, password } = req.body;
      const newUser = await AuthModel.createUser(username, password);
      // Here you might want to generate and return a JWT or similar
      return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}