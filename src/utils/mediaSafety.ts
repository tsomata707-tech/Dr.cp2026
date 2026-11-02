/**
 * Strict Media Safety Utility
 * Enforces showing ONLY external URLs for instructional content.
 * Prevents leaks of local storage/blob media for teaching materials.
 */

export function isSafeExternalUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:') || lower.startsWith('blob:')) {
    return true;
  }
  
  return false;
}

export function filterSafeExternalMedia<T extends { url?: string; videoUrl?: string }>(items: T[]): T[] {
  return items.filter(item => {
    const url = item.url || item.videoUrl;
    return isSafeExternalUrl(url);
  });
}

/**
 * Formats bytes to an exact human-readable Arabic file size string.
 */
export function formatRealFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} جيجابايت`;
}

