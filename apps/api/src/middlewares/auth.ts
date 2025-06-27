import { Request, Response, NextFunction } from 'express';
import { auth, usersCollection } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: "user" | "admin";
  createdAt: any;
  updatedAt: any;
  lastActiveAt: any;
  preferences: any | null;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token required' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = await auth.verifyIdToken(token);
    const userDoc = await usersCollection.doc(decoded.uid).get();

    if (!userDoc.exists) {
      const newUser: User = {
        uid: decoded.uid,
        name: decoded.name || 'Unknown',
        email: decoded.email || 'no-email@example.com',
        photoURL: decoded.picture || null,
        role: 'user',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastActiveAt: FieldValue.serverTimestamp(),
        preferences: null
      };
      await usersCollection.doc(decoded.uid).set(newUser);
      req.user = newUser;
    } else {
      req.user = userDoc.data() as User;
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Admin privileges required' });
    return;
  }

  next();
};