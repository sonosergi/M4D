import { AuthController } from '../../controllers/authControllersApp.js';
import validateUser from '../../middlewares/validateUser.js';


import { Router } from 'express';

export const authRouter = Router();

authRouter.post('/serverSession', AuthController.serverSession);
authRouter.post('/login', AuthController.login);
authRouter.post('/register', validateUser, AuthController.register);