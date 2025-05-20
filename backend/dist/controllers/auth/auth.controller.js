"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.updatePassword = exports.updateDetails = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../../models/User"));
const google_auth_library_1 = require("google-auth-library");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const express_validator_1 = require("express-validator");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        // Check if user exists
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password
        });
        // Generate email verification token
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        // Create verification URL
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
        // Send verification email
        const message = `You are receiving this email because you (or someone else) has registered a new account. Please make a PUT request to: \n\n ${verificationUrl}`;
        try {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification Token',
                message
            });
            sendTokenResponse(user, 200, res, 'Registration successful! Please check your email to verify your account.');
        }
        catch (err) {
            console.error('Send email error:', err);
            user.emailVerificationToken = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({
                success: false,
                error: 'Email could not be sent'
            });
        }
    }
    catch (err) {
        console.error('Register error:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email and password'
            });
        }
        // Check for user
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(401).json({
                success: false,
                error: 'Please verify your email address'
            });
        }
        sendTokenResponse(user, 200, res, 'Login successful!');
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
exports.login = login;
// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
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
// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
exports.getMe = getMe;
// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
const updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email
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
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
exports.updateDetails = updateDetails;
// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id).select('+password');
        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({
                success: false,
                error: 'Password is incorrect'
            });
        }
        user.password = req.body.newPassword;
        await user.save();
        sendTokenResponse(user, 200, res, 'Password updated successfully!');
    }
    catch (err) {
        console.error('Update password error:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
exports.updatePassword = updatePassword;
// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User_1.default.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'There is no user with that email'
            });
        }
        // Get reset token
        const resetToken = user.getResetPasswordToken();
        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            });
            await user.save({ validateBeforeSave: false });
            res.status(200).json({
                success: true,
                data: 'Email sent'
            });
        }
        catch (err) {
            console.error('Send email error:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({
                success: false,
                error: 'Email could not be sent'
            });
        }
    }
    catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
exports.forgotPassword = forgotPassword;
// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto_1.default
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');
        const user = await User_1.default.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid token or token has expired'
            });
        }
        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        sendTokenResponse(user, 200, res, 'Password reset successful!');
    }
    catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
exports.resetPassword = resetPassword;
// @desc    Verify email
// @route   GET /api/v1/auth/verifyemail/:verificationtoken
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        // Get verification token and hash it
        const verificationToken = crypto_1.default
            .createHash('sha256')
            .update(req.params.verificationtoken)
            .digest('hex');
        const user = await User_1.default.findOne({
            emailVerificationToken: verificationToken,
            emailVerified: false
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid token or email already verified'
            });
        }
        // Update user
        user.emailVerificationToken = undefined;
        user.emailVerified = true;
        await user.save();
        res.status(200).json({
            success: true,
            data: 'Email verified successfully!'
        });
    }
    catch (err) {
        console.error('Verify email error:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
exports.verifyEmail = verifyEmail;
// @desc    Google OAuth
// @route   POST /api/v1/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }
        if (!process.env.GOOGLE_CLIENT_ID) {
            throw new Error('GOOGLE_CLIENT_ID is not defined in environment variables');
        }
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({
                success: false,
                error: 'Invalid token'
            });
        }
        const { name, email, picture } = payload;
        // Check if user exists
        let user = await User_1.default.findOne({ email });
        if (user) {
            // Update user if they exist
            user = await User_1.default.findByIdAndUpdate(user._id, {
                googleId: sub,
                name: user.name || name,
                emailVerified: true
            }, { new: true, runValidators: true });
        }
        else {
            // Create new user
            user = await User_1.default.create({
                name,
                email,
                googleId: sub,
                emailVerified: true
            });
        }
        sendTokenResponse(user, 200, res, 'Google authentication successful!');
    }
    catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
exports.googleAuth = googleAuth;
// Helper function to send token response
const sendTokenResponse = (user, statusCode, res, message) => {
    // Create token
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
        success: true,
        message,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified
        }
    });
};
// Helper function to send email
const sendEmail = async (options) => {
    // Create a test account if in development
    let testAccount;
    if (process.env.NODE_ENV !== 'production') {
        testAccount = await nodemailer_1.default.createTestAccount();
    }
    // Create transporter
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
            user: process.env.SMTP_EMAIL || testAccount?.user,
            pass: process.env.SMTP_PASSWORD || testAccount?.pass
        }
    });
    // Send email
    const message = {
        from: `CourseCraft AI <${process.env.FROM_EMAIL || 'noreply@coursecraftai.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };
    const info = await transporter.sendMail(message);
    // Log the preview URL in development
    if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL: %s', nodemailer_1.default.getTestMessageUrl(info));
    }
};
//# sourceMappingURL=auth.controller.js.map