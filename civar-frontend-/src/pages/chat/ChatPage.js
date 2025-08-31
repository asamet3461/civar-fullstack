
import React, { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../context/ApiContext';
import { useParams } from 'react-router-dom';

export default function ChatPage() {
  const { user } = useAuth();
  const { BASE_URL, client } = useApi();
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatTitle, setChatTitle] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const connectionRef = useRef(null);

  
  const messagesEndRef = useRef(null);

  
  useEffect(() => {
    if (userId) {
      
      async function fetchOtherUser() {
        try {
          const res = await client.get(`/user/${userId}`);
          setOtherUser(res.data);
          setChatTitle((res.data?.name || res.data?.firstName || res.data?.ad || 'Kullanıcı') + ' ' + (res.data?.surname || res.data?.lastName || res.data?.soyad || ''));
        } catch {}
      }
      async function fetchMessages() {
        try {
          const res = await client.get(`/message/private/${userId}`);
          
          const mapped = res.data.map(m => ({
            senderName: m.SenderName ?? m.senderName,
            content: m.Content ?? m.content,
            createdAt: m.CreatedAt ?? m.createdAt,
            isMine: m.IsMine ?? m.isMine
          }));
          setMessages(mapped);
        } catch {}
      }
      fetchOtherUser();
      fetchMessages();
      
      async function markPrivateNotificationsRead() {
        try {
          const res = await client.get('/message/notifications/unread');
          const unread = res.data || [];
          
          const privateNotifs = unread.filter(n => {
            const notifType = n.Type || n.type;
            const senderId = n.SenderId || n.senderId;
            return (notifType === 'NewMessage' || notifType === 5) && String(senderId) === String(userId);
          });
          await Promise.all(privateNotifs.map(n => {
            const notifId = n.Id || n.id;
            if (notifId) {
              return client.put(`/message/notifications/${notifId}/read`).catch(() => {});
            }
            return null;
          }));
        } catch {}
      }
      markPrivateNotificationsRead();
    } else {
      
      async function fetchNeighborhoodName() {
        if (!user?.neighborhoodId) return;
        try {
          const res = await client.get(`/neighborhood/${user.neighborhoodId}`);
          setChatTitle(res.data?.neighbourhood || res.data?.name || 'Mahalle Sohbeti');
        } catch {}
      }
      async function fetchMessages() {
        if (!user?.neighborhoodId) return;
        try {
          const res = await client.get(`/message/neighborhood/${user.neighborhoodId}`);
          
          const mapped = res.data.map(m => ({
            senderName: m.SenderName ?? m.senderName,
            content: m.Content ?? m.content,
            createdAt: m.CreatedAt ?? m.createdAt,
            isMine: m.IsMine ?? m.isMine
          }));
          setMessages(mapped);
        } catch {}
      }
      
      async function markNeighborhoodNotificationsRead() {
        try {
          
          const res = await client.get('/message/notifications/unread');
          const unread = res.data || [];
          
          const mahalleNotifs = unread.filter(n => {
            const notifType = n.Type || n.type;
            const text = n.NotificationText || n.notificationText || n.content || n.message || n.text || '';
            return notifType === 'NewNeighborhoodMessage' || notifType === 8 || text.toLowerCase().includes('mahalle');
          });
          
          await Promise.all(mahalleNotifs.map(n => {
            const notifId = n.Id || n.id;
            if (notifId) {
              return client.put(`/message/notifications/${notifId}/read`).catch(() => {});
            }
            return null;
          }));
        } catch {}
      }
      fetchNeighborhoodName();
      fetchMessages();
      markNeighborhoodNotificationsRead();
    }
  }, [userId, user?.neighborhoodId, client]);

  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  
  useEffect(() => {
    const hubUrl = BASE_URL.replace('/api', '') + '/hubs/message';
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => localStorage.getItem('token') })
      .withAutomaticReconnect()
      .build();
    if (userId) {
      
      connection.on('ReceivePrivateMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });
    } else {
      
      connection.on('ReceiveNeighborhoodMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });
    }
    connection.start().catch(() => {});
    connectionRef.current = connection;
    return () => { connection.stop(); };
  }, [BASE_URL, userId]);

  async function send() {
    if (!input.trim()) return;
    if (userId) {
      
      try {
        await connectionRef.current?.invoke('SendPrivateMessage', userId, input);
      } catch {}
    } else if (user?.neighborhoodId) {
      
      try {
        await connectionRef.current?.invoke('SendNeighborhoodMessage', user.neighborhoodId, input);
      } catch {}
    }
    setInput('');
  }

  return (
    <div style={{height:'calc(100vh - 100px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f7f9fb'}}>
      <div style={{width:'100%', maxWidth:480, margin:'32px 0', background:'#fff', borderRadius:18, boxShadow:'0 4px 24px #0002', padding:'24px 18px 16px 18px', display:'flex', flexDirection:'column', minHeight:420, justifyContent:'space-between'}}>
        <h2 style={{marginBottom:16, color:'#1a237e', fontWeight:800, fontSize:26, letterSpacing:0.5, textAlign:'center', fontFamily:'Segoe UI, sans-serif'}}>
          {chatTitle || (userId ? 'Kişisel Sohbet' : 'Mahalle Sohbeti')}
        </h2>
        <div style={{flex:1, overflowY:'auto', background:'#f3f6fa', borderRadius:10, padding:'10px 8px', marginBottom:14, border:'1px solid #e3e7ee', minHeight:180, maxHeight:220}}>
          {messages.length === 0 && <div style={{color:'#aaa', textAlign:'center', marginTop:60, fontStyle:'italic'}}>Henüz mesaj yok.</div>}
          {messages.map((m, i) => {
            const dateObj = new Date(m.createdAt);
            const dateStr = dateObj.toLocaleDateString();
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={i} style={{marginBottom:10, display:'flex', alignItems:'center', background: m.senderName === user?.name || m.senderName === user?.username ? '#e8f5e9' : '#e3e7ee', borderRadius:7, padding:'6px 10px'}}>
                <div style={{fontWeight:700, color: m.senderName === user?.name || m.senderName === user?.username ? '#2e7d32' : '#3949ab', minWidth:54, fontFamily:'Segoe UI, sans-serif'}}>
                  {m.senderName === user?.name || m.senderName === user?.username ? 'Siz' : m.senderName}:
                </div>
                <div style={{marginLeft:8, color:'#222', fontSize:15, fontFamily:'Segoe UI, sans-serif'}}>{m.content}</div>
                <div style={{marginLeft:'auto', fontSize:12, color:'#888', fontFamily:'monospace'}}>{dateStr + ' ' + timeStr}</div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center', marginTop:0}}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Mesaj yazın..."
            style={{flex:1, padding:'10px 14px', borderRadius:8, border:'1.5px solid #b0bec5', fontSize:16, background:'#f9fafb', fontFamily:'Segoe UI, sans-serif'}}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
          />
          <button
            className="primary"
            type="button"
            onClick={send}
            style={{padding:'10px 30px', borderRadius:8, background:'linear-gradient(90deg,#2e7d32 60%,#43a047 100%)', color:'#fff', fontWeight:900, fontSize:17, border:'none', boxShadow:'0 2px 8px #2e7d3222', letterSpacing:0.5}}>
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
