
'use client';
import { FirebaseStorage, getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirebaseApp } from './provider';

export function useStorage(): FirebaseStorage | null {
    const app = useFirebaseApp();
    if (!app) return null;
    return getStorage(app);
}

export const uploadFile = async (storage: FirebaseStorage, file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
