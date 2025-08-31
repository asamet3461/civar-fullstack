import React, { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useNavigate } from 'react-router-dom';

export default function UpcomingCountdowns({ limit = 5, lookaheadDays = 7, neighborhoodId }) {
  const { client } = useApi();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetchEvents() {
      try {
        const res = await client.get('/event');
        let all = res.data || [];
        const now = new Date();
        const cutoff = new Date();
        cutoff.setDate(now.getDate() + lookaheadDays);

        
        function parseStart(raw){
          if (!raw) return null;
          if (raw instanceof Date) return raw;
          let s = String(raw).trim();

          
          let d = new Date(s);
          if (!isNaN(d)) return d;

          
          d = new Date(s.replace(' ', 'T'));
          if (!isNaN(d)) return d;

          
          d = new Date(s.replace(' ', 'T') + 'Z');
          if (!isNaN(d)) return d;

          
          const m = s.match(/(\d{4}-\d{2}-\d{2}).*(\d{2}:\d{2}(?::\d{2})?)/);
          if (m){
            const candidate = m[1] + 'T' + m[2];
            d = new Date(candidate);
            if (!isNaN(d)) return d;
            d = new Date(candidate + 'Z');
            if (!isNaN(d)) return d;
          }

          return null;
        }

        
        if (neighborhoodId != null) {
          all = all.filter(ev => {
            const evNId = ev?.neighborhoodId || ev?.NeighborhoodId || ev?.neighbourhoodId || ev?.neighborhood?.id || ev?.mahalleId || ev?.MahalleId;
            return evNId != null && String(evNId) === String(neighborhoodId);
          });
        }

        const upcoming = all
          .map(e => {
            
            const raw = e.startTime || e.StartTime || e.startsAt || e.start || e.begin || e.startAt || e.start_date || e.startDate || e.starts_at || null;
            const start = parseStart(raw);
            return {...e, _rawStart: raw, start};
          })
          .filter(e => e.start instanceof Date && !isNaN(e.start))
          .filter(e => e.start >= now && e.start <= cutoff)
          .sort((a,b) => a.start - b.start)
          .slice(0, limit);

        if (mounted) {
          console.log('UpcomingCountdowns raw count:', all.length);
          console.log('UpcomingCountdowns candidates after parse:', upcoming.length);
          
          upcoming.slice(0,10).forEach(ev => console.log('upcoming:', ev.id, ev.title, 'rawStart=', ev._rawStart, 'parsed=', ev.start));
          setEvents(upcoming);
        }
      } catch (err) {
        console.error('UpcomingCountdowns fetch error', err);
      }
    }
    fetchEvents();
    const iv = setInterval(fetchEvents, 60_000); 
    return () => { mounted = false; clearInterval(iv); };
  }, [client, limit, lookaheadDays, neighborhoodId]);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {events.map(ev => (
        <CountdownCard key={ev.id} ev={ev} />
      ))}
      {events.length === 0 && (
        <div style={{padding:10,background:'#fff',borderRadius:10,boxShadow:'0 6px 18px rgba(0,0,0,0.06)',border:'1px solid #eaf6ef'}}>Yaklaşan etkinlik yok.</div>
      )}
    </div>
  );
}

function CountdownCard({ ev }){
  const [left, setLeft] = useState(getLeft(ev.start));
  const navigate = useNavigate();

  useEffect(()=>{
    const t = setInterval(()=> setLeft(getLeft(ev.start)), 1000);
    return ()=>clearInterval(t);
  },[ev.start]);

  function getLeft(dt){
    const now = new Date();
    const diff = dt - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (24*3600*1000));
    const hours = Math.floor((diff % (24*3600*1000)) / (3600*1000));
    const minutes = Math.floor((diff % (3600*1000)) / (60*1000));
    const seconds = Math.floor((diff % (60*1000)) / 1000);
    return {days,hours,minutes,seconds};
  }

  if (!left) return (
    <div onClick={()=>navigate(`/events/${ev.id}`)} tabIndex={0} role="button" style={{padding:10,background:'#fff',borderRadius:10,boxShadow:'0 6px 18px rgba(0,0,0,0.06)',border:'1px solid #eaf6ef',cursor:'pointer'}}>
      <div style={{fontWeight:600,color:'#18813a'}}>{ev.title}</div>
      <div style={{color:'#888'}}>Şimdi</div>
    </div>
  );

  return (
    <div onClick={()=>navigate(`/events/${ev.id}`)} tabIndex={0} role="button" style={{padding:12,background:'#fff',borderRadius:10,boxShadow:'0 6px 18px rgba(0,0,0,0.06)',border:'1px solid #eaf6ef',cursor:'pointer'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontWeight:700,color:'#18813a'}}>{ev.title}</div>
          <div style={{fontSize:'.9rem',color:'#666'}}>Başlangıç: {ev.start.toLocaleString('tr-TR')}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:800,fontSize:'1.05rem'}}>{left.days>0? `${left.days}g ` : ''}{String(left.hours).padStart(2,'0')}:{String(left.minutes).padStart(2,'0')}:{String(left.seconds).padStart(2,'0')}</div>
          <div style={{fontSize:'.75rem',color:'#666'}}>kalan</div>
        </div>
      </div>
    </div>
  );
}
