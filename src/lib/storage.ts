
// --- Image Store (IndexedDB) ---

let db: IDBDatabase;

const DB_NAME = 'ImageStoreDB';
const STORE_NAME = 'images';
const DB_VERSION = 1;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB not supported.');
        resolve(false);
        return;
    }
    if (db) {
        resolve(true);
        return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB');
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    if (arr.length < 2) {
        throw new Error('Invalid data URL');
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
         throw new Error('Could not parse MIME type from data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}


export const saveImage = (dataURL: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('DB not initialized');
            return;
        }
        try {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const key = crypto.randomUUID();
            const blob = dataURLToBlob(dataURL);
            
            const request = store.put(blob, key);

            request.onsuccess = () => {
                resolve(key);
            };
            request.onerror = () => {
                console.error('Error saving image blob:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error('Error preparing to save image:', error);
            reject(error);
        }
    });
};

export const getImageBlob = (key: string): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('DB not initialized');
            return;
        }
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request: IDBRequest<Blob | undefined> = store.get(key);

        request.onsuccess = () => {
            resolve(request.result ? request.result : null);
        };
        request.onerror = () => {
            console.error('Error getting image blob:', request.error);
            reject(request.error);
        };
    });
};

export const deleteImage = (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db || !key || key.startsWith('http') || key.startsWith('data:')) {
            resolve();
            return;
        }
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            console.error('Error deleting image blob:', request.error);
            reject(request.error);
        };
    });
};

