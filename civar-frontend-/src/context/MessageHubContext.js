import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useApi } from './ApiContext';

const MessageHubContext = createContext(null);

export function MessageHubProvider({ children }) {
  const api = useApi();
  const BASE_URL = api?.BASE_URL || window.location.origin;
  const client = api?.client;
  const connRef = useRef(null);
  const listenersRef = useRef({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    
    const hubUrl = (BASE_URL || window.location.origin).replace('/api', '') + '/hubs/message';
    const conn = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => localStorage.getItem('token') })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    
    conn.on('ReceiveMessage', (message) => {
      Object.values(listenersRef.current).forEach(fn => fn({ type: 'private', message }));
    });

    
    conn.on('ReceiveNeighborhoodMessage', (message) => {
      Object.values(listenersRef.current).forEach(fn => fn({ type: 'neighborhood', message }));
    });

    conn.start()
      .then(() => {
        setConnected(true);
        console.log('SignalR connected successfully');
      })
      .catch(err => {
        console.error('SignalR start error', err);
        
        setTimeout(() => {
          if (connRef.current === conn) {
            conn.start().catch(console.error);
          }
        }, 5000);
      });

    connRef.current = conn;

    return () => {
      conn.stop().catch(()=>{});
      connRef.current = null;
      setConnected(false);
    };
  }, [BASE_URL]);

  const addMessageListener = (key, fn) => {
    listenersRef.current[key] = fn;
    return () => { delete listenersRef.current[key]; };
  };

  
  const parseJwt = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (e) {
      return null;
    }
  };

  const getSenderIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const claims = parseJwt(token);
    if (!claims) return null;
    return claims.sub || claims.nameid || claims.user_id || claims.id || null;
  };

  const sendMessage = async (dto) => {
    if (!client) throw new Error('API client not available');

    
    if (dto && dto.NeighborhoodId) {
      const payload = { NeighborhoodId: dto.NeighborhoodId, Content: dto.Content };
      return await client.post('/message/neighborhood', payload);
    }

    
    if (!dto.SenderId) {
      const sid = getSenderIdFromToken();
      if (sid) dto.SenderId = String(sid);
    }

    
    return await client.post('/message', dto);
  };

  const invokeSendPrivate = async (userId, message) => {
    if (!connRef.current) throw new Error('Hub not connected');
    return await connRef.current.invoke('SendPrivateMessage', String(userId), message);
  };

  const invokeSendNeighborhood = async (neighborhoodId, message) => {
    if (!connRef.current) throw new Error('Hub not connected');
    const payload = typeof message === 'string' ? { Content: message } : message;
    return await connRef.current.invoke('SendNeighborhoodMessage', neighborhoodId, payload);
  };

  const joinNeighborhood = async (neighborhoodId) => {
    if (!connRef.current) return;
    try { await connRef.current.invoke('JoinNeighborhoodGroup', neighborhoodId); }
    catch(e){ console.warn(e); }
  };

  const leaveNeighborhood = async (neighborhoodId) => {
    if (!connRef.current) return;
    try { await connRef.current.invoke('LeaveNeighborhoodGroup', neighborhoodId); }
    catch(e){ console.warn(e); }
  };

  return (
    <MessageHubContext.Provider value={{ connected, addMessageListener, sendMessage, invokeSendPrivate, invokeSendNeighborhood, joinNeighborhood, leaveNeighborhood }}>
      {children}
    </MessageHubContext.Provider>
  );
}

export function useMessageHub(){ return useContext(MessageHubContext); }
