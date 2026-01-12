import { Response, NextFunction } from 'express';
import { firestore } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { User, userSchema, userUpdateSchema } from '@schemas/user.schema'; 
import { AuthenticatedRequest } from '../middlewares/auth';

const usersCollection = firestore.collection('users');

// Helper to convert Firestore document to user response
const documentToUser = (doc: FirebaseFirestore.DocumentSnapshot) => ({
  uid: doc.id,
  ...doc.data(),
  createdAt: doc.data()?.createdAt?.toDate(),
  updatedAt: doc.data()?.updatedAt?.toDate(),
  lastActiveAt: doc.data()?.lastActiveAt?.toDate(),
});

export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userData = userSchema.parse(req.body); // Use the schema value
    
    if (userData.role === 'admin' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden: Only admins can create admin users' });
      return;
    }

    const docRef = await usersCollection.add({
      ...userData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastActiveAt: FieldValue.serverTimestamp(),
    });
    
    const newUserDoc = await docRef.get();
    res.status(201).json({ 
      ...documentToUser(newUserDoc),
      message: 'User created successfully' 
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (_: unknown, res: Response, next: NextFunction): Promise<void> => {
  try {
    const snapshot = await usersCollection
      .orderBy('createdAt', 'desc')
      .get();
    
    const users = snapshot.docs.map(documentToUser);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    const doc = await usersCollection.doc(id).get();
    
    if (!doc.exists) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(documentToUser(doc));
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.uid) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const doc = await usersCollection.doc(req.user.uid).get();
    
    if (!doc.exists) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json(documentToUser(doc));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userData = userUpdateSchema.parse(req.body); // Use the schema value
    
    if (!id) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    if (userData.role && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden: Only admins can change roles' });
      return;
    }

    await usersCollection.doc(id).update({
      ...userData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await usersCollection.doc(id).get();
    res.status(200).json({ 
      ...documentToUser(updatedDoc),
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    if (id === req.user?.uid) {
      res.status(403).json({ message: 'Forbidden: Cannot delete yourself' });
      return;
    }
    
    await usersCollection.doc(id).delete();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};