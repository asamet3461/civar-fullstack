


export async function fetchJson(path, options = {}) {
  
  const base = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || '';
  const url = path.startsWith('/') ? `${base}${path}` : path;

  const defaultHeaders = { 'Content-Type': 'application/json' };

  
  const providedAuth = options.headers && (options.headers.Authorization || options.headers.authorization);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeader = !providedAuth && token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    headers: { ...defaultHeaders, ...(options.headers || {}), ...authHeader },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    let body = text;
    try { body = JSON.parse(text); } catch (e) {  }
    const err = new Error(`Request failed: ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  return res.json();
}


export function fetchEndpoint() {
  return fetchJson('/api/endpoint');
}
