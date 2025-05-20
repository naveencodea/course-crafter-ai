import * as admin from 'firebase-admin';
declare const firebaseApp: admin.app.App;
export declare const auth: import("firebase-admin/lib/auth/auth").Auth;
export declare const db: admin.firestore.Firestore;
export declare const getFirebaseApp: () => admin.app.App;
export default firebaseApp;
