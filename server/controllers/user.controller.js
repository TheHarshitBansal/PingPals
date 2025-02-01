import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import otpGenerator from 'otp-generator';

//INFO: Sign JWT token
const signToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    });
}

//INFO: Register a new user
export const register = async (req, res, next) => {
    const { name, username, email, password } = req.body;
    if(!name || !username || !email || !password) {
        return res.status(400).json({message: 'Please provide a name, username, email, and password'});
    }

    const existingUser = await User.findOne({$or: [{username}, {email}]});
    if(existingUser && existingUser.verified) {
        return res.status(400).json({message: 'User with this username or email already exists'});
    }
    else if(existingUser && !existingUser.verified) {
        existingUser.name = name;
        existingUser.username = username;
        existingUser.email = email;
        existingUser.password = password;

        await existingUser.save();
        req.id = existingUser._id;
        next();
    }
    const user = await User.create({name, username, email, password});
    if(!user) {
        return res.status(400).json({message: 'User could not be created'});
    }

    await user.save();
    req.id = user._id;
    next();
}

//INFO: Send OTP to user's email
export const sendOTP = async (req, res) => {
    const { id } = req;
    const otp = otpGenerator.generate(4, {lowerCaseAlphabets: false, specialChars: false, upperCaseAlphabets: false});
    const otpExpires = Date.now() + 10 * 60 * 1000; //NOTE: 10 minutes

    const user = await User.findByIdAndUpdate(id, {otp, otpExpires}, {new: true});

    //TODO: Send OTP to user's email

    res.status(200).json({message: 'OTP sent successfully'});
}

//INFO: Verify OTP
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({email, otpExpires: {$gt: Date.now()}});
    if(!user) {
        return res.status(400).json({message: 'User not found or OTP expired'});
    }

    if(!user.comparePassword(otp, user.otp)) {
        return res.status(400).json({message: 'Invalid OTP'});
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({new: true, validateModifiedOnly: true});

    const token = signToken(user._id);

    res.status(200).json({token, message: 'OTP verified successfully'});
}

//INFO: Login a user
export const login = async (req, res) => {
    const { username, email, password } = req.body;
    if(!(username || email) || !password) {
        return res.status(400).json({message: 'Please provide a username or email and password'});
    }

    const user = await User.findOne({$or: [{username}, {email}]}).select('+password');
    if(!user) {
        return res.status(401).json({message: 'User not found'});
    }

    if(!await user.comparePassword(password, user.password)) {
        return res.status(401).json({message: 'Invalid password'});
    }

    const token = signToken(user._id);

    res.status(200).json({token, message: 'Login successful'});
}

//INFO: Protect routes
export const protect = async (req, res, next) => {
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


        if(user.passwordChangedAt && user.passwordChangedAt > decoded.iat) {
            return res.status(401).json({message: 'Password changed. Please login again'});
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized access'});
    }
}

//INFO: Forgot password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if(!email) {
        return res.status(400).json({message: 'Please provide an email'});
    }

    const user = await User.findOne({email});
    if(!user) {
        return res.status(404).json({message: 'User not found'});
    }

    const resetToken = user.createPasswordResetToken();
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/user/reset-password/${resetToken}`;

    try {
        //TODO: Send reset URL to user's email

        res.status(200).json({message: 'Reset URL sent successfully'});
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return res.status(500).json({message: 'Error sending email'});
    }
}

//INFO: Reset password
export const resetPassword = async (req, res) => {
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
}

//INFO: Update User's Profile
export const updateProfile = async (req, res) => {
    const { name, avatar, username, about } = req.body; 
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {new: true, validateModifiedOnly: true});

    res.status(200).json({user, message: 'Profile updated successfully'});
}