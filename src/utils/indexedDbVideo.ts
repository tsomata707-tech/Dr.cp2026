/**
 * IndexedDB helper for persisting local video files of any size without localStorage quota limits.
 */
const DB_NAME = 'cp_educational_videos_db';
const DB_VERSION = 1;
const STORE_NAME = 'video_blobs';

// In-memory fallback cache for instant retrieval and incognito resilience
const memoryBlobMap = new Map<string, Blob>();

function openVideoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a video file/blob in IndexedDB (with memory cache fallback)
 */
export async function storeVideoBlob(id: string, file: Blob, fileName: string): Promise<string> {
  memoryBlobMap.set(id, file);
  const objectUrl = URL.createObjectURL(file);

  try {
    const db = await openVideoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        id,
        blob: file,
        fileName,
        mimeType: file.type || 'video/mp4',
        updatedAt: Date.now(),
      };

      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // In-memory cache is already populated
  }

  return objectUrl;
}

/**
 * Retrieves a video blob from IndexedDB and returns a fresh Object URL
 */
export async function getVideoBlobUrl(id: string): Promise<string | null> {
  // First check memory map for instant hit
  const cached = memoryBlobMap.get(id);
  if (cached) {
    return URL.createObjectURL(cached);
  }

  try {
    const db = await openVideoDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        const result = req.result;
        if (result && result.blob) {
          memoryBlobMap.set(id, result.blob);
          const url = URL.createObjectURL(result.blob);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Deletes a video blob from IndexedDB
 */
export async function deleteVideoBlob(id: string): Promise<void> {
  try {
    const db = await openVideoDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // Ignore error
  }
}
