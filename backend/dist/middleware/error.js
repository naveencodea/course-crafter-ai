"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
// Not Found Error Handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
// Error Handler
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log to console for development
    console.error(err.stack);
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new Error(message);
        error.statusCode = 404;
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value entered for ${field}`;
        error = new Error(message);
        error.statusCode = 400;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error = new Error(message.join(', '));
        error.statusCode = 400;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new Error(message);
        error.statusCode = 401;
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new Error(message);
        error.statusCode = 401;
    }
    // Default to 500 server error
    const statusCode = error.statusCode || res.statusCode || 500;
    // Don't leak error details in production
    const response = {
        success: false,
        error: error.message || 'Server Error'
    };
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    // If it's a validation error, include the validation errors
    if (err.name === 'ValidationError') {
        response.errors = err.errors;
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.js.map