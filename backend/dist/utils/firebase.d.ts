import { auth as firebaseAuth } from 'firebase-admin';
import { Router } from 'express';
/**
 * Initialize Firebase Admin and set up authentication routes
 * @returns Express Router with authentication routes
 */
export declare const initializeFirebaseAuth: () => Router;
/**
 * Get the Firebase Admin Auth instance
 * @returns Firebase Admin Auth instance
 * @throws Error if Firebase Admin is not initialized
 */
export declare const getAuth: () => firebaseAuth.Auth;
declare const _default: {
    initializeFirebaseAuth: () => Router;
    getAuth: () => firebaseAuth.Auth;
};
export default _default;
