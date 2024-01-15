import { AuthController } from '../../controllers/auth.js';
import RateLimiters from '../../middlewares/rateLimiters.js';
import { validateUser } from '../../middlewares/validateUser.js';
import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/login', validateUser, RateLimiters.limiter, RateLimiters.speedLimiter, AuthController.login);
authRouter.post('/register', validateUser, AuthController.register );