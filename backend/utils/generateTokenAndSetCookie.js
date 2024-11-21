import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET_KEY, { expiresIn: "7d"});

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        samSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return token;
};