
import { FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 *
 * @param storage - The Firebase Storage instance.
 * @param file - The file to upload.
 * @param path - The desired path in the storage bucket (e.g., 'images/profile.jpg').
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadFile(storage: FirebaseStorage, file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    // Depending on requirements, you might want to re-throw the error
    // or return a specific error message or default URL.
    throw error;
  }
}

    