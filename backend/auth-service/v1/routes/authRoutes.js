import { AuthController } from '../../controllers/authControllers.js';
import RateLimiters from '../../middlewares/rateLimiters.js';
import { validateRegister, validate } from '../../middlewares/validateUser.js';
import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/login',validate, RateLimiters.limiter, RateLimiters.speedLimiter, AuthController.login);
authRouter.post('/register', validateRegister, validate, AuthController.register);