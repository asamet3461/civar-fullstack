import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';

export default function CivarEventShareBox({ onShared }) {
  const { client } = useApi();
  const { user } = useAuth();
  const userNeighborhoodId = user?.neighborhoodId || user?.neighborhoodID || user?.mahalleId || user?.mahalleID || '';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [neighborhoodId, setNeighborhoodId] = useState(userNeighborhoodId);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        const res = await client.get('/neighborhood');
        setNeighborhoods(res.data);
      } catch {}
    }
    fetchNeighborhoods();
  }, [client]);

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await client.post(`/event?userId=${user?.id || user?.userId}`, {
        title,
        description,
        startTime,
        endTime,
        location,
  neighborhoodId: userNeighborhoodId || neighborhoodId
      });
  setTitle('');
  setDescription('');
  setStartTime('');
  setEndTime('');
  setLocation('');
  setNeighborhoodId(userNeighborhoodId);
      setSuccess(true);
      if (onShared) onShared();
    } catch (err) {
      setError('Etkinlik oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#fff',
      boxShadow: '0 2px 16px 0 rgba(24,129,58,0.10)',
      borderRadius: 16,
      padding: '18px 16px 12px 16px',
      minWidth: 260,
      maxWidth: 320,
      margin: '0 auto',
      border: '1.5px solid #eaf6ef',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }}>
      <div style={{fontWeight:700, fontSize:'1.25rem', color:'#18813a', marginBottom:10, letterSpacing:0.2}}>Etkinlik Oluştur</div>
      <form onSubmit={handleShare} style={{display:'flex', flexDirection:'column', gap:12}}>
        <input name="title" placeholder="Başlık" value={title} onChange={e => setTitle(e.target.value)}
          style={{padding:'7px 10px',border:'1.5px solid #eaf6ef',borderRadius:7,fontSize:'.98rem',outline:'none',maxWidth:'100%',overflow:'hidden',wordBreak:'break-word'}} />
        <textarea name="description" rows={2} placeholder="Açıklama" value={description} onChange={e => setDescription(e.target.value)}
          style={{padding:'7px 10px',border:'1.5px solid #eaf6ef',borderRadius:7,fontSize:'.98rem',outline:'none',resize:'vertical',maxWidth:'100%',overflow:'auto',wordBreak:'break-word'}} />
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          <input name="startTime" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)}
            style={{flex:'1 1 180px',minWidth:0,padding:'6px 10px',border:'1.5px solid #eaf6ef',borderRadius:7,fontSize:'1.08rem',outline:'none',maxWidth:'100%',fontWeight:500,background:'#fff',color:'#222',overflow:'visible',fontFamily:'monospace'}} />
          <input name="endTime" type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)}
            style={{flex:'1 1 180px',minWidth:0,padding:'6px 10px',border:'1.5px solid #eaf6ef',borderRadius:7,fontSize:'1.08rem',outline:'none',maxWidth:'100%',fontWeight:500,background:'#fff',color:'#222',overflow:'visible',fontFamily:'monospace'}} />
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          <input name="location" placeholder="Konum" value={location} onChange={e => setLocation(e.target.value)}
            style={{flex:'1 1 120px',minWidth:0,padding:'6px 10px',border:'1.5px solid #eaf6ef',borderRadius:7,fontSize:'.95rem',outline:'none',maxWidth:'100%',overflow:'hidden',wordBreak:'break-word'}} />
          {userNeighborhoodId && neighborhoods.length > 0 ? (
            <div style={{flex:'1 1 100px',minWidth:0,padding:'6px 10px',border:'1.5px solid #eaf6ef',borderRadius:7,fontSize:'.95rem',background:'#f6f6f6',color:'#888',display:'flex',alignItems:'center',height:38}}>
              {
                (() => {
                  const match = neighborhoods.find(n => (n.id || n.neighborhoodId)?.toString() === userNeighborhoodId?.toString());
                  if (match && (match.name || match.neighbourhood)) {
                    return match.name || match.neighbourhood;
                  } else {
                    return 'Kullanıcı mahallesi bulunamadı';
                  }
                })()
              }
            </div>
          ) : neighborhoods.length > 0 ? (
            <select
              name="neighborhoodId"
              value={neighborhoodId}
              onChange={e => setNeighborhoodId(e.target.value)}
              style={{flex:'1 1 100px',minWidth:0,padding:'6px 10px',border:'1.5px solid #eaf6ef',borderRadius:7,fontSize:'.95rem',outline:'none',maxWidth:'100%'}}
              required
            >
              <option value="">Mahalle Seçiniz</option>
              {neighborhoods.map((n) => (
                <option key={n.id || n.neighborhoodId} value={n.id || n.neighborhoodId}>
                  {n.name || n.neighbourhood}
                </option>
              ))}
            </select>
          ) : (
            <input name="neighborhoodId" placeholder="Mahalle ID" value={userNeighborhoodId || neighborhoodId} onChange={e => setNeighborhoodId(e.target.value)}
              style={{flex:'1 1 100px',minWidth:0,padding:'6px 10px',border:'1.5px solid #eaf6ef',borderRadius:7,fontSize:'.95rem',outline:'none',maxWidth:'100%',overflow:'hidden',wordBreak:'break-word'}} disabled={!!userNeighborhoodId} />
          )}
        </div>
        <button type="submit" style={{
          background:'#18813a',color:'#fff',border:'none',borderRadius:7,padding:'9px 0',fontWeight:600,fontSize:'1.04rem',cursor:loading?'not-allowed':'pointer',transition:'background .2s',marginTop:2
        }} disabled={loading}>Oluştur</button>
        <div style={{minHeight:18,marginTop:2}}>
          {error && <span style={{color:'crimson',fontSize:'.93rem'}}>{error}</span>}
          {success && <span style={{color:'#0b6c3c',fontSize:'.93rem'}}>Kaydedildi</span>}
        </div>
      </form>
    </div>
  );
}
