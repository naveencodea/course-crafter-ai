"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.updatePassword = exports.updateDetails = exports.getMe = exports.googleLogin = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const email_1 = require("../utils/email");
// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password
        });
        // Generate email verification token
        const emailVerificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        // Create verification URL
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyemail/${emailVerificationToken}`;
        // Send verification email
        const message = `You are receiving this email because you need to verify your email address. Please make a GET request to: \n\n ${verificationUrl}`;
        await (0, email_1.sendEmail)({
            email: user.email,
            subject: 'Email Verification Token',
            message
        });
        sendTokenResponse(user, 200, res);
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        console.error('Registration error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }
        // Check for user
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        sendTokenResponse(user, 200, res);
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.login = login;
// @desc    Login with Google
// @route   POST /api/v1/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
    try {
        const { token } = req.body;
        // Verify Google token here (implementation depends on your Google OAuth setup)
        // This is a simplified example
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email, sub: googleId } = ticket.getPayload();
        // Check if user exists
        let user = await User_1.default.findOne({ googleId });
        if (!user) {
            // Create user if doesn't exist
            user = await User_1.default.create({
                name,
                email,
                googleId,
                emailVerified: true
            });
        }
        sendTokenResponse(user, 200, res);
    }
    catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.googleLogin = googleLogin;
// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.getMe = getMe;
// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
const updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name || req.user.name,
            email: req.body.email || req.user.email
        };
        const user = await User_1.default.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (err) {
        console.error('Update details error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.updateDetails = updateDetails;
// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
const updatePassword = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user.id).select('+password');
        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({ success: false, error: 'Password is incorrect' });
        }
        user.password = req.body.newPassword;
        await user.save();
        sendTokenResponse(user, 200, res);
    }
    catch (err) {
        console.error('Update password error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.updatePassword = updatePassword;
// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const user = await User_1.default.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, error: 'No user with that email' });
        }
        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        // Create reset url
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
        try {
            await (0, email_1.sendEmail)({
                email: user.email,
                subject: 'Password reset token',
                message
            });
            res.status(200).json({ success: true, data: 'Email sent' });
        }
        catch (err) {
            console.error('Send email error:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    }
    catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');
        const user = await User_1.default.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid token' });
        }
        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        sendTokenResponse(user, 200, res);
    }
    catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.resetPassword = resetPassword;
// @desc    Verify email
// @route   GET /api/v1/auth/verifyemail/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
    try {
        const emailVerificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');
        const user = await User_1.default.findOne({
            emailVerificationToken,
            emailVerificationExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid token' });
        }
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();
        // Redirect to login page or show success message
        res.status(200).json({
            success: true,
            data: 'Email verified successfully. You can now login.'
        });
    }
    catch (err) {
        console.error('Verify email error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
exports.verifyEmail = verifyEmail;
// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        data: {}
    });
};
exports.logout = logout;
// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE ? parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
        success: true,
        token
    });
};
//# sourceMappingURL=auth.js.map