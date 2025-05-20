"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuth = exports.initializeFirebaseAuth = void 0;
const firebase_1 = require("../config/firebase");
const auth_1 = __importDefault(require("../routes/auth"));
/**
 * Initialize Firebase Admin and set up authentication routes
 * @returns Express Router with authentication routes
 */
const initializeFirebaseAuth = () => {
    if (!firebase_1.auth) {
        throw new Error('Firebase Admin SDK not initialized');
    }
    console.log('Firebase Auth initialized successfully');
    return auth_1.default;
};
exports.initializeFirebaseAuth = initializeFirebaseAuth;
/**
 * Get the Firebase Admin Auth instance
 * @returns Firebase Admin Auth instance
 * @throws Error if Firebase Admin is not initialized
 */
const getAuth = () => {
    if (!firebase_1.auth) {
        throw new Error('Firebase Admin SDK not initialized');
    }
    return firebase_1.auth;
};
exports.getAuth = getAuth;
exports.default = {
    initializeFirebaseAuth: exports.initializeFirebaseAuth,
    getAuth: exports.getAuth,
};
//# sourceMappingURL=firebase.js.map