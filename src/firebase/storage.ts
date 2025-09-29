
'use client';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { useFirebaseApp } from './provider';

export function useStorage(): FirebaseStorage | null {
    const app = useFirebaseApp();
    if (!app) return null;
    return getStorage(app);
}
