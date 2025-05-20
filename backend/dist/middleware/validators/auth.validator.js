"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdatePassword = exports.validateResetPassword = exports.validateForgotPassword = exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegister = [
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty().trim().escape(),
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail().normalizeEmail(),
    (0, express_validator_1.check)('password', 'Please enter a password with 6 or more characters')
        .isLength({ min: 6 })
        .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/)
        .withMessage('Password must contain at least one uppercase, one lowercase, one number, and one special character'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
exports.validateLogin = [
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail().normalizeEmail(),
    (0, express_validator_1.check)('password', 'Password is required').exists(),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
exports.validateForgotPassword = [
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail().normalizeEmail(),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
exports.validateResetPassword = [
    (0, express_validator_1.check)('password', 'Please enter a password with 6 or more characters')
        .isLength({ min: 6 })
        .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/)
        .withMessage('Password must contain at least one uppercase, one lowercase, one number, and one special character'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
exports.validateUpdatePassword = [
    (0, express_validator_1.check)('currentPassword', 'Current password is required').exists(),
    (0, express_validator_1.check)('newPassword', 'Please enter a password with 6 or more characters')
        .isLength({ min: 6 })
        .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/)
        .withMessage('Password must contain at least one uppercase, one lowercase, one number, and one special character'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
//# sourceMappingURL=auth.validator.js.map