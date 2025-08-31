import React, { createContext, useContext, useEffect, useState } from 'react';
import { useApi } from './ApiContext';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { client, BASE_URL } = useApi();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!client) { setLoading(false); return; }
    if (!token) { setUser(null); setLoading(false); return; }
    client.defaults.headers = client.defaults.headers || {};
    client.defaults.headers.Authorization = `Bearer ${token}`;
    client.get('/auth/me')
      .then(r => {
        const userData = r.data;
        console.log('AuthContext - /auth/me yanıtı:', userData);

        
        if (userData) {
          userData.id = userData.id || userData.userId || userData.UserId || userData.Id || userData.userID || userData.UserID || null;
          
          userData.userId = userData.userId || userData.id;
        }

        
        if (userData && !userData.neighborhoodId) {
          userData.neighborhoodId = userData.neighborhoodID || 
                                   userData.mahalleId || 
                                   userData.mahalleID || 
                                   userData.NeighborhoodId || 
                                   userData.MahalleId ||
                                   userData.neighborhood?.id ||
                                   userData.mahalle?.id;
        }

        console.log('AuthContext - İşlenmiş userData (neighborhoodId):', userData.neighborhoodId);
        console.log('AuthContext - Normalize edilmiş user id:', userData.id, userData.userId);
        
        try {
          const rawOv = localStorage.getItem('userActivityOverrides');
          if (rawOv) {
            const obj = JSON.parse(rawOv) || {};
            if (obj[String(userData.id)]) {
              delete obj[String(userData.id)];
              localStorage.setItem('userActivityOverrides', JSON.stringify(obj));
            }
          }
        } catch (e) {
          
        }
        setUser(userData);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [client]);

  async function login(data) {
    try {
      console.log('Login fonksiyonu çağrıldı:', data);
      const res = await client.post('/auth/login', data);
      console.log('Login response:', res);
      const token = res.data.Token || res.data.token;
      if (token) {
        localStorage.setItem('token', token);
        client.defaults.headers = client.defaults.headers || {};
        client.defaults.headers.Authorization = `Bearer ${token}`;
        
        let userData = null;
        try {
          const me = await client.get('/auth/me');
          console.log('/auth/me response:', me);
          userData = me.data;
          if (userData) {
            userData.id = userData.id || userData.userId || userData.UserId || userData.Id || userData.userID || userData.UserID || null;
            userData.userId = userData.userId || userData.id;
          }
          
          if (userData && !userData.neighborhoodId) {
            userData.neighborhoodId = userData.neighborhoodID || 
                                     userData.mahalleId || 
                                     userData.mahalleID || 
                                     userData.NeighborhoodId || 
                                     userData.MahalleId ||
                                     userData.neighborhood?.id ||
                                     userData.mahalle?.id;
          }
          console.log('Login - İşlenmiş userData (neighborhoodId):', userData.neighborhoodId);
          console.log('Login - Normalize edilmiş user id:', userData.id, userData.userId);
          
          try {
            const rawOv = localStorage.getItem('userActivityOverrides');
            if (rawOv) {
              const obj = JSON.parse(rawOv) || {};
              if (obj[String(userData.id)]) {
                delete obj[String(userData.id)];
                localStorage.setItem('userActivityOverrides', JSON.stringify(obj));
              }
            }
          } catch (e) {}
        } catch (meErr) {
          console.error('Login sonrası /auth/me hatası:', meErr);
        }
        setUser(userData);
        
        setTimeout(() => {
          window.location.replace('/ana-sayfa');
        }, 100);
        return { success: true };
      }
      localStorage.removeItem('token');
      return { success: false, errors: ['Token alınamadı'] };
    } catch (err) {
      localStorage.removeItem('token');
      console.error('Login catch error:', err, err?.response);
      const data = err?.response?.data;
      if (data?.Message) return { success: false, errors: [data.Message] };
      return { success: false, errors: [err.message || 'Giriş hatası'] };
    }
  }

  async function register(data) {
    try {
      const res = await client.post('/auth/register', data);
      const token = res.data.Token || res.data.token;
      if (token) {
        localStorage.setItem('token', token);
        client.defaults.headers = client.defaults.headers || {};
        client.defaults.headers.Authorization = `Bearer ${token}`;
        const me = await client.get('/auth/me');
        const userData = me.data;
        console.log('Register - /auth/me yanıtı:', userData);

        if (userData) {
          userData.id = userData.id || userData.userId || userData.UserId || userData.Id || userData.userID || userData.UserID || null;
          userData.userId = userData.userId || userData.id;
        }

        
        if (userData && !userData.neighborhoodId) {
          userData.neighborhoodId = userData.neighborhoodID || 
                                   userData.mahalleId || 
                                   userData.mahalleID || 
                                   userData.NeighborhoodId || 
                                   userData.MahalleId ||
                                   userData.neighborhood?.id ||
                                   userData.mahalle?.id;
        }

        console.log('Register - İşlenmiş userData (neighborhoodId):', userData.neighborhoodId);
        console.log('Register - Normalize edilmiş user id:', userData.id, userData.userId);
        
        try {
          const rawOv = localStorage.getItem('userActivityOverrides');
          if (rawOv) {
            const obj = JSON.parse(rawOv) || {};
            if (obj[String(userData.id)]) {
              delete obj[String(userData.id)];
              localStorage.setItem('userActivityOverrides', JSON.stringify(obj));
            }
          }
        } catch (e) {}
        setUser(userData);
        return { success: true };
      }
      return { success: false, errors: ['Token alınamadı'] };
    } catch (err) {
      const data = err?.response?.data;
      if (data?.Errors) return { success: false, errors: data.Errors };
      if (data?.Message) return { success: false, errors: [data.Message] };
      return { success: false, errors: [err.message || 'Kayıt hatası'] };
    }
  }

  async function logout() {
    
    try {
      const uid = (user && (user.id || user.userId)) ? String(user.id || user.userId) : null;
      if (uid) {
        const raw = localStorage.getItem('userActivityOverrides');
        const obj = raw ? JSON.parse(raw) : {};
        const override = { isOnline: false, lastSeen: new Date().toISOString(), lastSeenText: 'şimdi', _local: true, _ts: Date.now() };
        obj[uid] = override;
        localStorage.setItem('userActivityOverrides', JSON.stringify(obj));
        
        try {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const ch = new BroadcastChannel('civar-user-activity');
            ch.postMessage({ type: 'userActivityOverride', userId: uid, override });
            ch.close();
          }
        } catch (e) {
          
        }
      }
    } catch (e) {
      console.warn('Could not write activity override', e);
    }
    
    try {
      const uid = (user && (user.id || user.userId)) ? String(user.id || user.userId) : null;
      if (uid) {
        console.info('Logout - notify attempt for uid:', uid);
        if (client) {
          try {
            
            const notify = client.post('/user/activity/mark-offline');
            const res = await Promise.race([
              notify.then(r => r).catch(err => { throw err; }),
              new Promise(r => setTimeout(() => r(null), 2000))
            ]);
            console.info('Logout - mark-offline response:', res && res.status, res && res.data);
          } catch (err) {
            console.warn('Logout - axios mark-offline failed:', err?.response?.status || err.message || err);
            
          }
        }

        
        try {
          const token = localStorage.getItem('token');
          const fetchUrl = (BASE_URL || '').replace(/\/+$/, '') + '/user/activity/mark-offline';
          const fetchRes = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: 'Bearer ' + token } : {})
            }
          });
          let bodyText = null;
          try { bodyText = await fetchRes.text(); } catch (e) {}
          console.info('Logout - fetch fallback response (mark-offline):', fetchRes.status, bodyText, 'url:', fetchUrl);
        } catch (e2) {
          console.warn('Logout - fetch fallback failed:', e2);
        }
      }
    } catch (e) {
      console.warn('Logout - notify outer error:', e);
    }

    localStorage.removeItem('token');
    if (client && client.defaults.headers) delete client.defaults.headers.Authorization;
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
