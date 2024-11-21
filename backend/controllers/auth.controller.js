import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

import { User } from "../models/user.model.js";
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendPasswordResetEmail, sendPasswordResetSuccessfull, sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/emails.js';

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
        await user.save();

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

// Login controller
export const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        // Check the user exist or not
        const user = await User.findOne({email});
        if(!user){
           return res.status(400).json({success: false, message: "Invalid credentials"});
        };

        // Check the password is valid
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({success: false, message: "Invalid creadentials"})
        }

        // Generate jwt token
        generateTokenAndSetCookie(res, user._id);

        // Reset last login date
        user.lastLogin = new Date();

        // Save updated user
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
};

// Logout controller
export const logout = (req, res) => {
    // Clear cookie
    res.clearCookie('token');
    res.status(200).json({success: true, message: "Logged out successfully"});
};

// Forget password controller
export const forget_password = async (req, res) => {
    const {email} = req.body;

    try {
        // Check user exist or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "Invalid email"});
        };

        // Generate reset password token and update expire date
        const resetPasswordToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordTokenExpires = Date.now() + 1 * 60 * 60 * 1000;

        // Update reset password token and expiry time with new generated values
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpiresAt = resetPasswordTokenExpires;

        // Save updated user
        await user.save();

        // Call function to send reset password email 
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`);

        res.status(200).json({success: true, message: "Password reset link shared to your email"});
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    };
};

// Reset password controller
export const reset_password = async (req, res) => {
    // Extract token from parameter
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Check user and token valid or not
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });
        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired reset token"});
        };

        // Hashing new password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Update user with new password and remove existing token and expire time
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        // Save updated user
        await user.save();

        // Send password reset successfull email
        await sendPasswordResetSuccessfull(user.email);

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    };
};

// Check Authentication controller
export const checkAuth = async (req, res) => {
    try {
        // Check user exist or not
        const user = await User.findById(req.userId).select("-password");
        if(!user) return res.status(400).json({success: false, message: "User not found"});

        res.status(200).json({success: true, user});
    } catch (error) {
        res.status(400).json({success:false, message: error.message});
    };
};