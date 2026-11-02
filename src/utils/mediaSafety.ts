/**
 * Strict Media Safety Utility
 * Enforces showing ONLY external URLs for instructional content.
 * Prevents leaks of local storage/blob media for teaching materials.
 */

export function isSafeExternalUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  
  // Only allow web protocols (http, https)
  // Specifically block 'blob:', 'data:', and local file paths if any
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    return false;
  }
  
  if (lower.startsWith('blob:') || lower.startsWith('data:')) {
    return false;
  }

  // Common external providers are safe
  return true;
}

export function filterSafeExternalMedia<T extends { url?: string; videoUrl?: string }>(items: T[]): T[] {
  return items.filter(item => {
    const url = item.url || item.videoUrl;
    return isSafeExternalUrl(url);
  });
}
