'use client';

const DB_NAME = 'ViaHogarDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject(false);
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveImage = (id: string, blob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject('DB not initialized');
    }
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.put({ id, blob });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getImage = (id: string): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject('DB not initialized');
    }
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result ? request.result.blob : null);
    };
    request.onerror = () => reject(request.error);
  });
};

export const deleteImage = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject('DB not initialized');
    }
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
