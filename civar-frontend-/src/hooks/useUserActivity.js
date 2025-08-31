import { useQuery } from '@tanstack/react-query';
import { useApi } from '../context/ApiContext';

function formatLastSeen(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'şimdi';
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 3600 * 24) return `${Math.floor(diff / 3600)} saat önce`;
  return date.toLocaleString();
}


export default function useUserActivity(userIds = []) {
  const { client } = useApi();

  const cleaned = (userIds || []).filter(Boolean);

  const { data, isLoading, error } = useQuery({
    queryKey: ['userActivity', cleaned.join(',')],
    queryFn: async () => {
      if (!cleaned.length) return {};
      
      
      const payloadIds = cleaned.map(id => String(id));
      const tryRequests = [
        
        { method: 'post', url: '/user/activity', data: payloadIds }, 
        
        { method: 'post', url: '/user/activity', data: { userIds: payloadIds } }, 
        { method: 'post', url: '/user/activity', data: { ids: payloadIds } }, 
        { method: 'post', url: '/user/activity', data: { UserIds: payloadIds } }, 
        { method: 'get', url: `/user/activity`, params: { userIds: payloadIds.join(',') } }, 
      ];

      let res = null;
      let lastErr = null;
      for (const req of tryRequests) {
        try {
          if (req.method === 'post') {
            res = await client.post(req.url, req.data);
          } else {
            res = await client.get(req.url, { params: req.params });
          }
          
          try {
            console.info('useUserActivity - request succeeded', { request: req, status: res?.status, data: res?.data });
          } catch (noop) {}
          break;
        } catch (err) {
          lastErr = err;
          
          try {
            const rsp = err?.response;
            const info = {
              attemptedRequest: { url: req.url, method: req.method, data: req.data, params: req.params },
              status: rsp?.status,
              responseData: rsp?.data,
              responseText: rsp && rsp.data && typeof rsp.data === 'object' ? JSON.stringify(rsp.data) : String(rsp?.data),
              requestBody: err?.config?.data,
            };
            console.warn('useUserActivity - prób request failed: ' + (info.responseText || info.status || ''), info);
          } catch (noop) {}
        }
      }
      if (!res) {
        
        throw lastErr || new Error('No response from /user/activity');
      }
      
  const arr = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      const map = {};
      arr.forEach(item => {
        const rawId = item.userId ?? item.id ?? item.user?.id;
        const id = rawId == null ? null : String(rawId);
        if (!id) return;

        
        const candidates = [
          'lastSeen', 'lastSeenAt', 'last_seen', 'last_seen_at', 'lastSeenUtc', 'last_seen_utc',
          'lastSeenDate', 'lastSeenOn', 'last_seen_on', 'last_seen_date', 'LastSeen', 'LastSeenAt'
        ];
        let chosen = null;
        let chosenVal = null;
        for (const k of candidates) {
          if (Object.prototype.hasOwnProperty.call(item, k) && item[k] != null) {
            chosen = k;
            chosenVal = item[k];
            break;
          }
        }
        
        if (!chosen && item.user && typeof item.user === 'object') {
          for (const k of candidates) {
            if (Object.prototype.hasOwnProperty.call(item.user, k) && item.user[k] != null) {
              chosen = `user.${k}`;
              chosenVal = item.user[k];
              break;
            }
          }
        }

        
        if (!chosen) {
          chosenVal = item.lastSeen || item.lastSeenAt || item.last_seen || null;
          chosen = chosenVal ? 'fallback' : null;
        }

        
        let lastSeenIso = null;
        if (chosenVal != null) {
          
          if (typeof chosenVal === 'number') {
            lastSeenIso = chosenVal > 1e12 ? new Date(chosenVal) : new Date(chosenVal * 1000);
          } else if (typeof chosenVal === 'string') {
            const s = chosenVal.trim();
            const match = /\/Date\(([-\d]+)(?:[+-]\d+)?\)\//.exec(s);
            if (match) {
              const ms = parseInt(match[1], 10);
              lastSeenIso = new Date(ms);
            } else if (/^[0-9]{10,}$/.test(s)) {
              
              const n = parseInt(s, 10);
              lastSeenIso = n > 1e12 ? new Date(n) : new Date(n * 1000);
            } else {
              
              const parsed = new Date(s);
              if (!isNaN(parsed.getTime())) lastSeenIso = parsed;
            }
          } else {
            try { const parsed = new Date(chosenVal); if (!isNaN(parsed.getTime())) lastSeenIso = parsed; } catch(e) { lastSeenIso = null; }
          }
        }

        const lastSeenText = lastSeenIso && !isNaN(lastSeenIso.getTime()) ? formatLastSeen(lastSeenIso) : '';

        map[id] = {
          isOnline: !!(item.isOnline ?? item.isActive ?? item.online),
          lastSeen: lastSeenIso ? lastSeenIso.toISOString() : null,
          lastSeenText,
          _debug_field: chosen,
        };
      });
      
      cleaned.forEach(id => { const k = id == null ? '' : String(id); if (!map[k]) map[k] = { isOnline: false, lastSeen: null, lastSeenText: '' }; });

      
      try {
        const raw = localStorage.getItem('userActivityOverrides');
        if (raw) {
          const overrides = JSON.parse(raw);
          for (const [k, v] of Object.entries(overrides)) {
            map[String(k)] = { ...(map[String(k)] || {}), ...v };
          }
        }
      } catch (e) {
        
      }

      return map;
    },
  enabled: cleaned.length > 0 && !!client,
  staleTime: 1000 * 10, 
  cacheTime: 1000 * 60, 
  
  
  refetchInterval: 1000 * 5, 
  refetchOnWindowFocus: true,
  });

  return { data: data || {}, isLoading, error, formatLastSeen };
}
