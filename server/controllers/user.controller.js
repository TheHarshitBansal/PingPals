import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import otpGenerator from 'otp-generator';
import sendMail from '../services/mailer.js';
import asyncHandler from '../middlewares/asyncHandler.middleware.js'
import otpTemplate from '../templates/sendOTP.template.js'
import resetPasswordTemplate from '../templates/resetPassword.template.js'
import crypto from 'crypto';

//INFO: Sign JWT token
const signToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    });
}

//INFO: Register a new user
export const register = asyncHandler(async (req, res) => {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
        return res.status(400).json({ message: 'Please provide a name, username, email, and password' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser && existingUser.verified) {
        return res.status(400).json({ message: 'User with this username or email already exists' });
    } else if (existingUser && !existingUser.verified) {
        existingUser.name = name;
        existingUser.username = username;
        existingUser.email = email;
        existingUser.password = password;
        await existingUser.save();
        req.id = existingUser._id;
    } else {
        const user = await User.create({ name, username, email, password });
        if (!user) {
            return res.status(400).json({ message: 'User could not be created' });
        }
        await user.save();
        req.id = user._id;
    }
    await sendOTP(req, res);
});

//INFO: Send OTP to user's email
export const sendOTP = asyncHandler(async (req, res) => {
    if (!req.id) {
        return res.status(400).json({ message: "User ID is missing" });
    }

    const user = await User.findById(req.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const otp = otpGenerator.generate(4, { lowerCaseAlphabets: false, specialChars: false, upperCaseAlphabets: false });
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
    await user.save({ validateBeforeSave: false });

    try {
        await sendMail({ name: user.name, email: user.email, subject: 'Verify your email for PingPals', html: otpTemplate(user.name, otp) });
        return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({ message: 'Error sending OTP' });
    }
});

//INFO: Verify OTP
export const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({email, otpExpires: {$gt: Date.now()}});
    if(!user) {
        return res.status(400).json({message: 'User not found or OTP expired'});
    }

    if(user.otp !== otp) {
        return res.status(400).json({message: 'Invalid OTP'});
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({new: true, validateModifiedOnly: true});

    const token = signToken(user._id);

    res.status(200).json({token, message: 'OTP verified successfully', user});
})

//INFO: Login a user
export const login = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    if(!identifier || !password) {
        return res.status(400).json({message: 'Please provide a username or email and password'});
    }

    const user = await User.findOne({$or: [{username:identifier}, {email:identifier}]}).select('+password');
    if(!user) {
        return res.status(401).json({message: 'User not found'});
    }

    if(!await user.comparePassword(password, user.password)) {
        return res.status(401).json({message: 'Invalid password'});
    }

    user.password = undefined;
    const token = signToken(user._id);

    res.status(200).json({token, message: 'Login successful', user});
})

//INFO: Protect routes
export const protect = asyncHandler(async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if(req.cookies.token) {
        token = req.cookies.token;
    }

    if(!token) {
        return res.status(401).json({message: 'Unauthorized access'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user) {
            return res.status(401).json({message: 'User not found'});
        }


        if(user.passwordChangedAt && user.passwordChangedAt < decoded.iat) {
            return res.status(401).json({message: 'Password changed. Please login again'});
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized access'});
    }
})

//INFO: Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if(!email) {
        return res.status(400).json({message: 'Please provide an email'});
    }

    const user = await User.findOne({email});
    if(!user) {
        return res.status(404).json({message: 'User not found'});
    }

    const resetToken = await user.createPasswordResetToken();
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/user/reset-password/${resetToken}`;

    try {
        await sendMail({name: user.name, email: user.email, subject: 'Reset your password for PingPals', html: resetPasswordTemplate(user.name, resetUrl)});
        res.status(200).json({message: 'Reset URL sent successfully'});
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return res.status(500).json({message: 'Error sending email'});
    }
})

//INFO: Reset password
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if(!token) {
        return res.status(400).json({message: 'Invalid token'});
    }

    if(!password || !confirmPassword) {
        return res.status(400).json({message: 'Please provide a password and confirm password'});
    }

    const resetToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({passwordResetToken: resetToken, passwordResetExpires: {$gt: Date.now()}});
    if(!user) {
        return res.status(400).json({message: 'Invalid token or token expired'});
    }

    if(password !== confirmPassword) {
        return res.status(400).json({message: 'Passwords do not match'});
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({new: true, validateModifiedOnly: true});
    res.status(200).json({message: 'Password reset successfully'});
})

//INFO: Update User's Profile
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, avatar, username, about } = req.body; 
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {new: true, validateModifiedOnly: true});

    res.status(200).json({user, message: 'Profile updated successfully'});
})

//INFO: Change Password
export const changePassword = asyncHandler(async (req, res) => {
    const {id, currentPassword, newPassword, confirmNewPassword } = req.body;

    if(!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({message: 'Please provide current password, new password, and confirm new password'});
    }

    if(newPassword !== confirmNewPassword) {
        return res.status(400).json({message: 'Passwords do not match'});
    }

    const user = await User.findById(id).select('+password');
    if(!await user.comparePassword(currentPassword, user.password)) {
        return res.status(401).json({message: 'Invalid password'});
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    res.status(200).json({message: 'Password changed successfully'});
})