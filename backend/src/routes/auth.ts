import { Router, Request, Response, NextFunction } from 'express';
// Import the auth instance from firebase config
import { auth as firebaseAuth } from '../config/firebase.js';

// Import custom type declarations
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import custom type declarations using dynamic import
await import('../../types/express');

// Interface for user profile update data
interface UserProfileUpdate {
  displayName?: string;
  photoURL?: string;
}

// Interface for provider data
interface ProviderData {
  providerId: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const router = Router();

// Middleware to verify Firebase ID token
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error: unknown) {
    console.error('Error verifying token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return res.status(401).json({ 
      error: 'Unauthorized - Invalid or expired token',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// Get current user
router.get('/me', verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await firebaseAuth.getUser(req.user.uid);
    
    // Map provider data to ensure proper typing
    const providerData: ProviderData[] = user.providerData.map(provider => ({
      providerId: provider.providerId || null,
      email: provider.email || null,
      displayName: provider.displayName || null,
      photoURL: provider.photoURL || null
    }));
    
    res.status(200).json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      emailVerified: user.emailVerified,
      providerData
    });
  } catch (error: unknown) {
    console.error('Error fetching user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user data';
    res.status(500).json({ 
      error: 'Error fetching user data',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { displayName, photoURL } = req.body as UserProfileUpdate;
    
    if (displayName === undefined && photoURL === undefined) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const updateData: UserProfileUpdate = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    
    const user = await firebaseAuth.updateUser(req.user.uid, updateData);
    
    res.status(200).json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
    });
  } catch (error: unknown) {
    console.error('Error updating profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
    res.status(500).json({ 
      error: 'Error updating profile',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

export default router;
