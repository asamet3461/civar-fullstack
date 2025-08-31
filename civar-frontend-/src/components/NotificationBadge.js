
import React, { useEffect, useState, useRef } from 'react';
import { useApi } from '../context/ApiContext';
import { useNavigate } from 'react-router-dom';


export default function NotificationBadge({ icon }) {
  const { client } = useApi();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef();
  const navigate = useNavigate();

  
  useEffect(() => {
    async function markAllAsRead() {
      if (open && notifications.length > 0 && unreadCount > 0) {
        try {
          await client.put('/message/notifications/read-all');
          setUnreadCount(0);
          setNotifications([]);
        } catch (error) {
          
        }
      }
    }
    markAllAsRead();
    
    
  }, [open]);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await client.get('/message/notifications/unread');
        setUnreadCount(res.data.length);
        setNotifications(res.data);
      } catch {
        setUnreadCount(0);
        setNotifications([]);
      }
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [client]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>
      <span onClick={() => setOpen(o => !o)} style={{ cursor: 'pointer' }}>{icon}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 7px',
            fontSize: 12,
            fontWeight: 700,
            minWidth: 20,
            textAlign: 'center',
          }}>
            {unreadCount}
          </span>
        )}
      </span>
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 32,
          minWidth: 260,
          background: '#fff',
          border: '1px solid #eaf6ef',
          borderRadius: 10,
          boxShadow: '0 2px 12px rgba(24,129,58,0.13)',
          zIndex: 100,
          padding: 10,
        }}>
          <div style={{fontWeight:600, color:'#18813a', marginBottom:8}}>Bildirimler</div>
          {notifications.length === 0 ? (
            <div style={{color:'#888', fontSize:'.97rem'}}>Okunmamış bildiriminiz yok.</div>
          ) : (
            <ul style={{listStyle:'none',margin:0,padding:0,maxHeight:260,overflowY:'auto'}}>
              {notifications.map((n, i) => {
                let text = n.NotificationText || n.notificationText || n.content || n.message || n.text || 'Yeni bildirim';
                
                if (typeof text === 'string') {
                  text = text.replace("'Interested'", "'İlgileniyor'").replace('Interested', 'İlgileniyor');
                  text = text.replace("'Attending'", "'Katılıyor'").replace('Attending', 'Katılıyor');
                  text = text.replace("'Declined'", "'Katılamaz'").replace('Declined', 'Katılamaz');
                }
                const createdAt = n.CreatedAt || n.createdAt || n.created_at;
                const dateStr = createdAt && createdAt !== '0001-01-01T00:00:00' && createdAt !== '-infinity'
                  ? new Date(createdAt).toLocaleString('tr-TR')
                  : '';
                const handleClick = async () => {
                  

                  const notifId = n.Id || n.id;
                  const notifType = n.Type || n.type;
                  const senderId = n.SenderId || n.senderId;
                  const receiverId = n.ReceiverId || n.receiverId;
                  const eventId = n.EventId || n.eventId || n.eventID || n.event_id;
                  const postId = n.PostId || n.postId || n.postID || n.post_id;

                  console.log('=== Notification Debug ===');
                  console.log('Full notification object:', n);
                  console.log('notifId:', notifId);
                  console.log('notifType:', notifType);
                  console.log('SenderId:', senderId);
                  console.log('ReceiverId:', receiverId);
                  console.log('Text:', text);
                  console.log('========================');

                  
                  if (notifId) {
                    try {
                      await client.put(`/message/notifications/${notifId}/read`);
                    } catch (error) {
                      console.error('Bildirim okundu olarak işaretlenemedi:', error);
                    }
                  } else {
                    console.error('Bildirimde id yok!');
                  }


                  
                  
                  if (
                    notifType === 'PostComment' ||
                    notifType === 'Post' ||
                    text.toLowerCase().includes('post') ||
                    text.toLowerCase().includes('yorum') ||
                    postId
                  ) {
                    if (postId) {
                      console.log('Navigating to post detail:', postId);
                      navigate(`/posts/${postId}`);
                    } else {
                      
                      console.log('Post notification but no postId, fallback to /posts');
                      navigate('/posts');
                    }
                  }
                  
                  else if (
                    notifType === 'EventRSVP' ||
                    notifType === 'Event' ||
                    notifType === 'EventUpdate' ||
                    notifType === 'EventCreated' ||
                    notifType === 'EventDeleted' ||
                    text.toLowerCase().includes('etkinliğine') ||
                    eventId
                  ) {
                    if (eventId) {
                      console.log('Navigating to event detail:', eventId);
                      navigate(`/events/${eventId}`);
                    } else {
                      
                      console.log('Event notification but no eventId, fallback to /events');
                      navigate('/events');
                    }
                  }
                  
                  else if (notifType === 'NewNeighborhoodMessage' || notifType === 8 || text.toLowerCase().includes('mahalle')) {
                    console.log('Navigating to neighborhood chat: /chat');
                    navigate(`/chat`);
                  }
                  
                  else if ((notifType === 'NewMessage' || notifType === 5) && senderId) {
                    console.log('Navigating to private chat with:', senderId);
                    navigate(`/chat/${senderId}`);
                  }
                  
                  else if (senderId) {
                    console.log('Navigating to chat with SenderId:', senderId);
                    navigate(`/chat/${senderId}`);
                  } else {
                    console.log('Fallback: Navigating to general chat');
                    navigate(`/chat`);
                  }

                  
                  setOpen(false);

                  
                  setTimeout(async () => {
                    try {
                      const res = await client.get('/message/notifications/unread');
                      setUnreadCount(res.data.length);
                      setNotifications(res.data);
                    } catch {
                      setUnreadCount(0);
                      setNotifications([]);
                    }
                  }, 500);
                };
                return (
                  <li key={n.id || n.Id || i} style={{padding:'7px 0',borderBottom:'1px solid #eaf6ef',fontSize:'.97rem',color:'#222',cursor:'pointer'}} onClick={handleClick}>
                    <div>{text}</div>
                    <div style={{fontSize:'.93rem',color:'#888'}}>{dateStr}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
