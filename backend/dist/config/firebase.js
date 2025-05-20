"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseApp = exports.db = exports.auth = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    // Return existing app if already initialized
    if (admin.apps.length > 0) {
        return admin.app();
    }
    try {
        // Parse the service account key from environment variable
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
        if (!serviceAccount.private_key) {
            throw new Error('Firebase service account key is missing or invalid');
        }
        const app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: serviceAccount.private_key.replace(/\\\\n/g, '\n'),
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL,
        });
        console.log('Firebase Admin initialized successfully');
        return app;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to initialize Firebase Admin:', errorMessage);
        // In production, we want to fail fast if Firebase can't be initialized
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        throw new Error(`Firebase initialization failed: ${errorMessage}`);
    }
};
// Initialize Firebase
const firebaseApp = initializeFirebase();
// Export initialized services
exports.auth = admin.auth(firebaseApp);
exports.db = admin.firestore(firebaseApp);
// Export the Firebase app instance
const getFirebaseApp = () => firebaseApp;
exports.getFirebaseApp = getFirebaseApp;
exports.default = firebaseApp;
//# sourceMappingURL=firebase.js.map