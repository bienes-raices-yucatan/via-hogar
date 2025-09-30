

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

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const exportData = async (properties: any[], submissions: any[], siteName: string, customLogo: string | null): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!db) return reject('DB not initialized');

        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const getAllRequest: IDBRequest<any[]> = store.getAll();
        const getAllKeysRequest: IDBRequest<IDBValidKey[]> = store.getAllKeys();

        let blobs: Blob[];
        let keys: IDBValidKey[];

        getAllRequest.onsuccess = () => {
            blobs = getAllRequest.result;
            if (keys) processBlobs();
        };
        getAllRequest.onerror = (event) => reject('Error fetching blobs: ' + (event.target as IDBRequest).error);

        getAllKeysRequest.onsuccess = () => {
            keys = getAllKeysRequest.result;
            if (blobs) processBlobs();
        };
        getAllKeysRequest.onerror = (event) => reject('Error fetching keys: ' + (event.target as IDBRequest).error);

        const processBlobs = async () => {
            try {
                const dataUrlPromises = blobs.map(blob => blobToDataURL(blob));
                const dataUrls = await Promise.all(dataUrlPromises);

                const images: { [key: string]: string } = {};
                keys.forEach((key, index) => {
                    images[key as string] = dataUrls[index];
                });
                
                const exportObject = {
                    properties,
                    submissions,
                    images,
                    siteName,
                    customLogo
                };
                resolve(JSON.stringify(exportObject, null, 2));

            } catch (error) {
                reject('Failed to convert blobs to data URLs: ' + error);
            }
        };
    });
};


export const importData = async (jsonString: string): Promise<{ properties: any[], submissions: any[], siteName: string, customLogo: string | null }> => {
    return new Promise(async (resolve, reject) => {
        if (!db) return reject('DB not initialized');
        
        try {
            const data = JSON.parse(jsonString);
            const { properties, submissions, images, siteName, customLogo } = data;
            
            if (!properties || !images) {
                return reject('Invalid import file format.');
            }

            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // Clear existing images first
            store.clear();

            // Save new images
            for (const key in images) {
                const dataUrl = images[key];
                const blob = dataURLToBlob(dataUrl);
                store.put(blob, key);
            }

            transaction.oncomplete = () => {
                resolve({ properties, submissions, siteName, customLogo });
            };

            transaction.onerror = (event) => {
                reject('Error writing to IndexedDB: ' + (event.target as IDBTransaction).error);
            };

        } catch (error) {
            reject('Failed to parse or import data: ' + error);
        }
    });
};
