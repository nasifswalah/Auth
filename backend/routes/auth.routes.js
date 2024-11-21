import express from 'express';
import { forget_password, login, logout, reset_password, signup, verifyEmail } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup); // Route for signup / create new user
router.post('/login', login); // Route for login
router.post('/logout', logout); // Route for logout
router.post('/verify-email', verifyEmail); // Route for user verification
router.post('/forget-password', forget_password); // Route for user forget password
router.post('/reset-password/:token', reset_password); // Route for reset password

export default router;