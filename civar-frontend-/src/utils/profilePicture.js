
export function normalizeProfilePictureUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//.test(url))
  if (url.startsWith('/')) {
    
    const apiUrl = process.env.REACT_APP_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    return apiUrl + url;
  }
  return url;
}
