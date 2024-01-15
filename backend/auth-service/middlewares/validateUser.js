import { check } from 'express-validator';

export const validateUser = [
  check('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 5 })
    .withMessage('Username must be at least 5 characters long'),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];