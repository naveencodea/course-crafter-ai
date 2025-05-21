import { auth as firebaseAdmin } from '../config/firebase';
import authRoutes from '../routes/auth';
/**
 * Initialize Firebase Admin and set up authentication routes
 * @returns Express Router with authentication routes
 */
export const initializeFirebaseAuth = () => {
    if (!firebaseAdmin) {
        throw new Error('Firebase Admin SDK not initialized');
    }
    console.log('Firebase Auth initialized successfully');
    return authRoutes;
};
/**
 * Get the Firebase Admin Auth instance
 * @returns Firebase Admin Auth instance
 * @throws Error if Firebase Admin is not initialized
 */
export const getAuth = () => {
    if (!firebaseAdmin) {
        throw new Error('Firebase Admin SDK not initialized');
    }
    return firebaseAdmin;
};
export default {
    initializeFirebaseAuth,
    getAuth,
};
//# sourceMappingURL=firebase.js.map