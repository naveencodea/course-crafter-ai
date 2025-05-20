"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isAuthenticated = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    let token;
    try {
        // Get token from header or cookie
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }
        // Make sure token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route. No token provided.'
            });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
        // Make sure the token has an id
        if (!decoded.id) {
            throw new Error('Invalid token: Missing user ID');
        }
        // Get user from the token
        const user = await User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        req.user = user;
        next();
    }
    catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route. Invalid or expired token.'
        });
    }
};
exports.protect = protect;
// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }
        const userRole = req.user.role || 'user';
        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: `User role '${userRole}' is not authorized to access this route.`
            });
        }
        next();
    };
};
exports.authorize = authorize;
// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Not authenticated. Please log in.'
        });
    }
    next();
};
exports.isAuthenticated = isAuthenticated;
// Check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized as an admin.'
        });
    }
    next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=auth.js.map