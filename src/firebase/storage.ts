
'use client';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { useFirebaseApp } from './provider';

/**
 * Hook to get the Firebase Storage instance.
 * It's crucial to call this at the top level of a React component,
 * not inside event handlers.
 */
export function useStorage(): FirebaseStorage | null {
    const app = useFirebaseApp();
    if (!app) return null;
    return getStorage(app);
}

    