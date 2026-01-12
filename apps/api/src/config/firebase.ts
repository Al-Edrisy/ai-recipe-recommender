import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { User } from '@schemas/user.schema';

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const firestore = admin.firestore();
const auth = admin.auth();
const { FieldValue } = admin.firestore;

// Firestore data converter
const userConverter = {
  toFirestore: (user: User) => ({
    ...user,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastActiveAt: user.lastActiveAt
  }),
  fromFirestore: (snapshot: admin.firestore.QueryDocumentSnapshot): User => {
    const data = snapshot.data();
    return {
      ...data,
      uid: snapshot.id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastActiveAt: data.lastActiveAt
    } as User;
  }
};

const usersCollection = firestore.collection('users').withConverter(userConverter);

export { firestore, auth, usersCollection, FieldValue };