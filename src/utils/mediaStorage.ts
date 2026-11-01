import { syncGlobalQuestionsAndLevels, subscribeToGlobalData } from './realtimeService';
import { storeVideoBlob, getVideoBlobUrl, deleteVideoBlob } from './indexedDbVideo';

export interface StoredAsset {
  id: string;
  name: string;
  type: 'video' | 'image' | 'document';
  mimeType: string;
  sizeBytes: number;
  url: string; // Data URL, Blob URL, or Cloud URL
  blobId?: string;
  createdAt: string;
  customTitle?: string;
}

const STORAGE_ASSETS_KEY = 'cp_media_storage_assets_v1';

// In-memory cache of resolved asset URLs for instant rendering across page reloads
const activeUrlCache = new Map<string, string>();

export function getStoredAssets(): StoredAsset[] {
  try {
    const raw = localStorage.getItem(STORAGE_ASSETS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((asset) => {
          // If URL was stripped for localStorage but we have a cached Object URL in memory
          if ((!asset.url || asset.url.startsWith('blob:')) && asset.blobId) {
            const cachedUrl = activeUrlCache.get(asset.blobId);
            if (cachedUrl) {
              return { ...asset, url: cachedUrl };
            }
          }
          return asset;
        });
      }
    }
  } catch {}
  return [];
}

/**
 * Hydrates missing/stripped blob URLs from IndexedDB for assets with blobId
 */
export async function hydrateAssetUrls(): Promise<StoredAsset[]> {
  const assets = getStoredAssets();
  let updated = false;

  const resolvedAssets = await Promise.all(
    assets.map(async (asset) => {
      if (asset.blobId) {
        // Try getting fresh object URL from IndexedDB
        const blobUrl = await getVideoBlobUrl(asset.blobId);
        if (blobUrl) {
          activeUrlCache.set(asset.blobId, blobUrl);
          if (asset.url !== blobUrl) {
            updated = true;
            return { ...asset, url: blobUrl };
          }
        }
      }
      return asset;
    })
  );

  if (updated && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cp-media-storage-updated', { detail: resolvedAssets }));
  }

  return resolvedAssets;
}

// Auto-trigger hydration on initial script load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    hydrateAssetUrls().catch(() => {});
  }, 100);
}

export function saveStoredAssets(assets: StoredAsset[], syncRemote: boolean = true): void {
  // Save active URLs in memory cache
  assets.forEach((a) => {
    if (a.blobId && a.url) {
      activeUrlCache.set(a.blobId, a.url);
    }
  });

  // Prepare lightweight version for localStorage (strip heavy base64 URLs if blobId exists or url > 100KB)
  const localStorageAssets = assets.map((a) => {
    if (a.blobId || (a.url && a.url.startsWith('data:') && a.url.length > 100000)) {
      return { ...a, url: a.blobId ? '' : '' }; // Keep metadata lightweight in localStorage
    }
    return a;
  });

  try {
    localStorage.setItem(STORAGE_ASSETS_KEY, JSON.stringify(localStorageAssets));
  } catch (err) {
    console.warn('QuotaExceededError caught in saveStoredAssets, saving minimal metadata only...', err);
    try {
      const minimal = assets.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        mimeType: a.mimeType,
        sizeBytes: a.sizeBytes,
        url: a.blobId ? '' : (a.url?.startsWith('http') ? a.url : ''),
        blobId: a.blobId,
        createdAt: a.createdAt,
        customTitle: a.customTitle,
      }));
      localStorage.setItem(STORAGE_ASSETS_KEY, JSON.stringify(minimal));
    } catch (finalErr) {
      console.error('Failed to save to localStorage:', finalErr);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cp-media-storage-updated', { detail: assets }));
  }

  if (syncRemote) {
    // Sync assets (using dataUrl/url if small enough or external HTTP link) to Firebase RTDB
    const syncPayload = assets.map((a) => ({
      ...a,
      url: a.url && !a.url.startsWith('blob:') && a.url.length < 300000 ? a.url : undefined,
    }));
    syncGlobalQuestionsAndLevels('storageAssets' as any, syncPayload).catch(() => {});
  }
}

export async function addStoredAsset(
  file: File,
  customTitle?: string,
  onProgress?: (progress: number) => void
): Promise<StoredAsset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|wmv|flv|3gp)$/i.test(file.name);
        const isDoc = file.type === 'application/pdf' || file.name.endsWith('.pdf');
        const assetType: 'video' | 'image' | 'document' = isVideo ? 'video' : isDoc ? 'document' : 'image';

        // Always store uploaded file in IndexedDB for high performance & unlimited storage size
        const blobId = `asset_blob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        let finalUrl = dataUrl;

        try {
          await storeVideoBlob(blobId, file, file.name);
          const freshBlobUrl = await getVideoBlobUrl(blobId);
          if (freshBlobUrl) {
            finalUrl = freshBlobUrl;
            activeUrlCache.set(blobId, freshBlobUrl);
          }
        } catch {
          // Fall back to dataUrl if IndexedDB fails
        }

        const newAsset: StoredAsset = {
          id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          type: assetType,
          mimeType: file.type || (isVideo ? 'video/mp4' : isDoc ? 'application/pdf' : 'image/png'),
          sizeBytes: file.size,
          url: finalUrl,
          blobId,
          createdAt: new Date().toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          customTitle: customTitle?.trim() || file.name,
        };

        const existing = getStoredAssets();
        const updated = [newAsset, ...existing];
        saveStoredAssets(updated);
        resolve(newAsset);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('تعذر قراءة الملف من الجهاز'));
    reader.readAsDataURL(file);
  });
}

export function addUrlAsset(url: string, title: string, type: 'video' | 'image' | 'document'): StoredAsset {
  const newAsset: StoredAsset = {
    id: `asset_url_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: title,
    type,
    mimeType: type === 'video' ? 'video/mp4' : type === 'document' ? 'application/pdf' : 'image/png',
    sizeBytes: 0,
    url: url.trim(),
    createdAt: new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    customTitle: title.trim(),
  };

  const existing = getStoredAssets();
  const updated = [newAsset, ...existing];
  saveStoredAssets(updated);
  return newAsset;
}

export function deleteStoredAsset(id: string): boolean {
  const existing = getStoredAssets();
  const target = existing.find((a) => a.id === id);
  if (target && target.blobId) {
    deleteVideoBlob(target.blobId).catch(() => {});
    activeUrlCache.delete(target.blobId);
  }
  const filtered = existing.filter((a) => a.id !== id);
  if (filtered.length !== existing.length) {
    saveStoredAssets(filtered);
    return true;
  }
  return false;
}

