import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';

export default function EventsList({ limit }){
  const { client } = useApi();
  const { user } = useAuth();
  
  const neighborhoodId = user?.neighborhoodId || user?.neighborhoodID || user?.mahalleId || user?.mahalleID || user?.NeighborhoodId || user?.MahalleId || user?.neighborhood?.id || user?.mahalle?.id || null;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const { data, isLoading, error } = useQuery({
    
    queryKey:['events', limit, neighborhoodId],
    queryFn: async ()=> {
      const res = await client.get('/event');
      let events = res.data || [];
      
      if (neighborhoodId) {
        events = events.filter(ev => {
          const evNId = ev?.neighborhoodId || ev?.NeighborhoodId || ev?.neighbourhoodId || ev?.neighborhood?.id || ev?.mahalleId || ev?.MahalleId;
          return evNId != null && String(evNId) === String(neighborhoodId);
        });
      } else {
        
        events = [];
      }
      if (limit) events = events.slice(0, limit);
      return events;
    }
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      
      const userId = user?.id || user?.userId || user?.Id || user?.UserID;
      return await client.delete(`/event/${id}?userId=${userId}`);
    },
    onSuccess: () => qc.invalidateQueries({queryKey:['events']})
  });
  const updateMutation = useMutation({
    mutationFn: async ({id, values}) => {
      const toUtcIso = (v) => v ? new Date(v).toISOString() : '';
      const payload = {
        title: values.title,
        description: values.description,
        startTime: toUtcIso(values.startTime),
        endTime: toUtcIso(values.endTime),
        location: values.location
      };
      return await client.put(`/event/${id}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({queryKey:['events']});
      setEditingId(null);
      setEditValues({});
    }
  });
  if (isLoading) return <div>Etkinlikler yükleniyor...</div>;
  if (error) return <div>Etkinlikler yüklenirken hata oluştu</div>;
  if (!isLoading && Array.isArray(data) && data.length === 0) return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:180}}>
      <div style={{
        fontFamily: "'Poppins', 'Segoe UI', Roboto, Arial, sans-serif",
        fontSize: '1.05rem',
        fontWeight: 600,
        color: '#18813a'
      }}>
        Mahallende etkinlik bulunamadı
      </div>
    </div>
  );
  return (
    <div className="events-list">
      {data.map(ev => {
        
        const eventId = ev.id || ev.Id || ev.eventId;
        const eventUserId = ev.userId || ev.UserId;
        return (
          <div className="card event-item" key={eventId}>
            {editingId === eventId ? (
              <form onSubmit={e => {
                e.preventDefault();
                
                if (!user || (eventUserId && (user.id || user.userId) !== eventUserId)) {
                  return;
                }
                updateMutation.mutate({id: eventId, values: editValues});
              }} style={{marginBottom:8, display:'flex', flexDirection:'column', gap:10}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <input style={{border:'1px solid #eaf6ef', borderRadius:8, padding:'8px 10px', fontSize:'1rem'}} value={editValues.title || ''} onChange={e => setEditValues(v => ({...v, title: e.target.value}))} placeholder="Başlık" />
                <textarea style={{border:'1px solid #eaf6ef', borderRadius:8, padding:'8px 10px', fontSize:'1rem', resize:'vertical'}} value={editValues.description || ''} onChange={e => setEditValues(v => ({...v, description: e.target.value}))} placeholder="Açıklama" />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <input type="datetime-local" style={{border:'1px solid #eaf6ef', borderRadius:8, padding:'8px 10px', fontSize:'1rem'}} value={editValues.startTime || ''} onChange={e => setEditValues(v => ({...v, startTime: e.target.value}))} />
                <input type="datetime-local" style={{border:'1px solid #eaf6ef', borderRadius:8, padding:'8px 10px', fontSize:'1rem'}} value={editValues.endTime || ''} onChange={e => setEditValues(v => ({...v, endTime: e.target.value}))} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <input style={{border:'1px solid #eaf6ef', borderRadius:8, padding:'8px 10px', fontSize:'1rem'}} value={editValues.location || ''} onChange={e => setEditValues(v => ({...v, location: e.target.value}))} placeholder="Konum" />
                <input style={{border:'1px solid #eaf6ef', borderRadius:8, padding:'8px 10px', fontSize:'1rem'}} value={editValues.neighborhoodName || ''} onChange={e => setEditValues(v => ({...v, neighborhoodName: e.target.value}))} placeholder="Mahalle" />
              </div>
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button type="submit" className="primary" style={{background:'#18813a',color:'#fff',border:'none',borderRadius:8,padding:'8px 22px',fontWeight:600,cursor:'pointer'}} disabled={updateMutation.isLoading}>Kaydet</button>
                <button type="button" style={{background:'#fff',border:'1px solid #eaf6ef',color:'#888',borderRadius:8,padding:'8px 22px',fontWeight:500,cursor:'pointer'}} onClick={()=>setEditingId(null)}>İptal</button>
              </div>
            </form>
          ) : (
            <>
              <h3 className="title">{ev.title}</h3>
              <div className="meta">
                {ev.neighborhoodName && <span className="neighborhood">{ev.neighborhoodName}</span>}
                {ev.startTime && <span>Başlangıç: {new Date(ev.startTime).toLocaleString('tr-TR')}</span>}
                {ev.endTime && <span>Bitiş: {new Date(ev.endTime).toLocaleString('tr-TR')}</span>}
              </div>
              <div className="meta">
                {ev.userName && <span>Oluşturan: <b>{ev.userName}</b></span>}
              </div>
              <div className="desc">{ev.description}</div>
              {ev.location && <div className="meta">@ {ev.location}</div>}
              <div style={{display:'flex',gap:8,marginTop:8}}>
                {(user && (!eventUserId || (user.id || user.userId) === eventUserId)) && (
                <button
                  style={{background:'#18813a',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}}
                  onClick={()=>{
                    setEditingId(eventId);
                    
                    const toInputLocal = (d) => {
                      if (!d) return '';
                      const dt = new Date(d);
                      dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
                      return dt.toISOString().slice(0,16);
                    };
                    setEditValues({
                      title: ev.title,
                      description: ev.description,
                      startTime: toInputLocal(ev.startTime),
                      endTime: toInputLocal(ev.endTime),
                      location: ev.location,
                      neighborhoodName: ev.neighborhoodName
                    });
                  }}
                >Düzenle</button>)}
                {confirmingDeleteId === eventId && user && (!eventUserId || (user.id || user.userId) === eventUserId) ? (
                  <>
                    <span style={{color:'#c00',fontWeight:500,marginRight:8}}>Silinsin mi?</span>
                    <button
                      style={{background:'#c00',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}}
                      onClick={()=>{
                        setConfirmingDeleteId(null);
                        deleteMutation.mutate(eventId);
                      }}
                    >Evet</button>
                    <button
                      style={{background:'#fff',border:'1px solid #eaf6ef',color:'#888',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}}
                      onClick={()=>setConfirmingDeleteId(null)}
                    >Vazgeç</button>
                  </>
                ) : (
                  (user && (!eventUserId || (user.id || user.userId) === eventUserId)) && (
                  <button
                    style={{background:'#fff',border:'1px solid #eaf6ef',color:'#c00',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}}
                    onClick={()=>setConfirmingDeleteId(eventId)}
                  >Sil</button>)
                )}
                <button
                  style={{background:'#fff',border:'1px solid #eaf6ef',color:'#18813a',borderRadius:6,padding:'6px 16px',fontWeight:500,cursor:'pointer'}}
                  onClick={()=>navigate(`/events/${eventId}`)}
                >Detay</button>
                {}
                <button
                  style={{background:'transparent',border:'none',color:'#18813a',padding:0,marginLeft:10,cursor:'pointer'}}
                  onClick={() => navigate('/chat')}
                  title="Mesajlaşma"
                >Mesaj</button>
              </div>
            </>
          )}
        </div>
        );
      })}
    </div>
  );
}
