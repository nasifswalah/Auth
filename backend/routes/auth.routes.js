import express from 'express';
import { login, logout, signup, verifyEmail } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup); // Route for signup / create new user
router.post('/login', login); // Route for login
router.post('/logout', logout); // Route for logout
router.post('/verify-email', verifyEmail); // Route for user verification

export default router;