import bcryptjs from 'bcryptjs';

import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/emails.js';

// Signup controller 
export const signup = async (req, res) => {
    const {email, password, name} = req.body;

    try {
        // Check the required fields are filled or not
        if (!email || !password || !name){
            throw new Error("Please fill all fields");
        };   

        // Check the user already exist or not
        const existingUser = await User.findOne({email});
        if (existingUser){
           return res.status(400).json({ success: false, message: "User already exists"});
        };

        // Hashing password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Creating random code for the verification code
        const verificationToken = Math.floor( 100000 + Math.random() * 900000).toString(); 

        // Create new user
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        });

        // Save new user
        await user.save();

        // Generate token and set cookie 
        generateTokenAndSetCookie(res, user._id);

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user:{
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message});
    };
};

// Email verification controller
export const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        // Check the user exist or not
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now()}
        });
        if(!user) {
            throw new Error("Invalid verification code");
        };

        // Send welcome email to user
        await sendWelcomeEmail(user.email, user.name);

        // Edit the user data after verification
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        // Save updated user
        user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message});
    };
};

export const login = (req, res) => {
    res.send("Login Controller");
};

// Logout controller
export const logout = (req, res) => {
    // Clear cookie
    res.clearCookie('token');
    res.status(200).json({success: true, message: "Logged out successfully"});
};