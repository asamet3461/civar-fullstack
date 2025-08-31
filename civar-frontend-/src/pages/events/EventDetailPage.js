
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';

const RSVP_STATUS_MAP = {
  going: 'Attending',
  interested: 'Interested',
  not_going: 'Declined'
};


export default function EventDetailPage() {
  const { id } = useParams();
  const { client } = useApi();
  const { user } = useAuth();
  
  const [neighborhoodName, setNeighborhoodName] = useState('');
  const [creatorName, setCreatorName] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await client.get(`/event/${id}`);
      console.log('Event details response:', response.data);
      return response.data;
    },
    enabled: !!id
  });

  
  
  useEffect(() => {
    if (!data) return;
    let mounted = true;

    const ensureNames = async () => {
      try {
        
        if (data.neighborhoodName && mounted) {
          setNeighborhoodName(data.neighborhoodName);
        }

        
        if (!data.neighborhoodName && data.neighborhoodId) {
          try {
            const nResp = await client.get(`/neighborhood/${data.neighborhoodId}`);
            const n = nResp.data;
            const nName = n?.Neighbourhood || n?.NeighbourhoodName || n?.neighbourhood || n?.neighbourhoodName || n?.name || n?.Neighbourhood;
            if (mounted && nName) setNeighborhoodName(nName);
          } catch (e) {
            console.debug('Neighborhood fetch failed (non-fatal):', e);
          }
        }

        
        if (data.userId) {
          try {
            const uResp = await client.get(`/user/${data.userId}`);
            const u = uResp.data || {};

            
            const first = u?.firstName || u?.firstname || u?.UserFirstName || u?.FirstName || u?.name || u?.Name || '';
            const last = u?.lastName || u?.lastname || u?.surname || u?.LastName || u?.last_name || '';

            let fullName = '';
            if (first && last) fullName = `${first} ${last}`;
            else if (u?.fullName || u?.FullName) fullName = u?.fullName || u?.FullName;
            else if (first) fullName = first;
            else fullName = u?.UserName || u?.userName || u?.name || '';

            if (mounted && fullName) setCreatorName(fullName);
          } catch (e) {
            console.debug('User fetch failed (non-fatal):', e);
          }
        } else {
          
          if (data.userName && mounted) setCreatorName(data.userName);
        }
      } catch (err) {
        console.error('Failed to ensure creator/neighborhood names for event detail:', err);
      }
    };

    ensureNames();

    return () => { mounted = false; };
  }, [data?.userId, data?.neighborhoodId, data?.neighborhoodName, client]);

  

  
  const rsvpMutation = useMutation({
    mutationFn: async (statusKey) => {
      const status = RSVP_STATUS_MAP[statusKey];
      
      console.log('Current user:', user);
      console.log('Sending RSVP request with status:', status);

      
      const userId = user?.Id || user?.id || user?.userId || user?.UserID;

      
      const resp = await client.post(`/event/${id}/rsvp`, { UserRSVPStatus: status }, { params: { userId } });
      console.log('RSVP response (axios):', resp && resp.data);
      return resp.data;
    },
    onSuccess: (data) => {
      console.log('RSVP updated successfully:', data);
      refetch();
    },
    onError: (error) => {
      console.error('RSVP update failed:', error);
    }
  });

  
  const userId = user?.Id || user?.id || user?.userId || user?.UserID;
  console.log('Current user ID:', userId);
  
  
  
  let myStatus = null;
  let rsvps = data?.RSVPs || [];
  
  
  console.log('Event data:', data);
  
  if (Array.isArray(rsvps)) {
    const myRSVP = rsvps.find(x => {
      const rsvpUserId = x?.UserId || x?.userId;
      return rsvpUserId?.toString() === userId?.toString();
    });
    
    myStatus = myRSVP?.UserRSVPStatus || myRSVP?.userRSVPStatus;
    console.log('Found RSVP in array:', myRSVP);
  }
  
  
  if (!myStatus && data?.UserRSVPStatus) {
    myStatus = data.UserRSVPStatus;
    console.log('Found RSVP in root data:', myStatus);
  }
  
  console.log('Final determined user RSVP status:', myStatus);
  
  
  const mahalleUsers = data?.Participants || data?.participants || data?.RSVPs || [];

  
  const dataCreatorFull = [
    data?.userFirstName || data?.firstName || data?.firstname || data?.UserFirstName,
    data?.userLastName || data?.lastName || data?.lastname || data?.surname || data?.last_name || data?.LastName
  ].filter(Boolean).join(' ');

  const displayCreatorName = creatorName || dataCreatorFull || data?.userName || data?.UserName || '';

  if (isLoading) return <div>Yükleniyor...</div>;
  if (error) return <div>Etkinlik yüklenemedi.</div>;
  if (!data) return <div>Etkinlik bulunamadı.</div>;

  return (
    <div className="card" style={{ maxWidth: 700, margin: '32px auto' }}>
      <h2>{data.title}</h2>
      <div style={{ color: '#18813a', fontWeight: 500 }}>{data.location}</div>
      <div style={{ margin: '8px 0', color: '#666' }}>
        {new Date(data.startTime || data.date).toLocaleString('tr-TR')} - {data.endTime ? new Date(data.endTime).toLocaleString('tr-TR') : ''}
      </div>
      <div style={{ margin: '8px 0', color: '#18813a', fontWeight: 600 }}>
        {(neighborhoodName || data.neighborhoodName) && <span>Mahalle: {neighborhoodName || data.neighborhoodName}</span>}
      </div>
      <div style={{ margin: '8px 0', color: '#18813a', fontWeight: 600 }}>
        {displayCreatorName && <span>Oluşturan: {displayCreatorName}</span>}
      </div>
      <div style={{ margin: '16px 0', whiteSpace: 'pre-line' }}>{data.description}</div>

      {}
      <div style={{ margin: '24px 0 12px 0', padding: '16px', background: '#f8fafc', borderRadius: 10 }}>
        <div style={{ fontWeight: 600, color: '#18813a', marginBottom: 8 }}>Katılım Durumun</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <button
            style={{ 
              background: myStatus === 'Attending' ? '#18813a' : '#fff', 
              color: myStatus === 'Attending' ? '#fff' : '#18813a', 
              border: '1px solid #18813a', 
              borderRadius: 8, 
              padding: '6px 18px', 
              fontWeight: 500, 
              cursor: rsvpMutation.isLoading ? 'wait' : 'pointer' 
            }}
            onClick={() => rsvpMutation.mutate('going')}
            disabled={rsvpMutation.isLoading}
          >Katılıyorum</button>
          <button
            style={{ 
              background: myStatus === 'Interested' ? '#18813a' : '#fff', 
              color: myStatus === 'Interested' ? '#fff' : '#18813a', 
              border: '1px solid #18813a', 
              borderRadius: 8, 
              padding: '6px 18px', 
              fontWeight: 500, 
              cursor: rsvpMutation.isLoading ? 'wait' : 'pointer' 
            }}
            onClick={() => rsvpMutation.mutate('interested')}
            disabled={rsvpMutation.isLoading}
          >İlgileniyorum</button>
          <button
            style={{ 
              background: myStatus === 'Declined' ? '#18813a' : '#fff', 
              color: myStatus === 'Declined' ? '#fff' : '#18813a', 
              border: '1px solid #18813a', 
              borderRadius: 8, 
              padding: '6px 18px', 
              fontWeight: 500, 
              cursor: rsvpMutation.isLoading ? 'wait' : 'pointer' 
            }}
            onClick={() => rsvpMutation.mutate('not_going')}
            disabled={rsvpMutation.isLoading}
          >Katılamam</button>
        </div>
        {rsvpMutation.isLoading && <div style={{ color: '#888', fontStyle: 'italic' }}>Güncelleniyor...</div>}
        {rsvpMutation.isError && <div style={{ color: 'crimson' }}>Hata oluştu: Katılım durumu güncellenemedi.</div>}
        {myStatus && <div style={{ color: '#18813a', fontWeight: 500 }}>
          Seçiminiz: {myStatus === 'Attending' ? 'Katılıyorum' : myStatus === 'Interested' ? 'İlgileniyorum' : myStatus === 'Declined' ? 'Katılamam' : ''}
        </div>}
      </div>

      {}
      <div style={{ margin: '24px 0 0 0', padding: '16px', background: '#f8fafc', borderRadius: 10 }}>
        <div style={{ fontWeight: 600, color: '#18813a', marginBottom: 8 }}>Mahallenin Katılım Durumu</div>
        
        {}
        <div style={{ display: 'none' }}>
          <pre>{JSON.stringify({ mahalleUsers: mahalleUsers?.slice(0, 2), dataRSVPs: data?.RSVPs?.slice(0, 2) }, null, 2)}</pre>
        </div>
        
        {mahalleUsers && mahalleUsers.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {mahalleUsers.map((u, idx) => {
              
              const userName = u.UserName || u.userName || u.name || u.Name || 'Kullanıcı';
              const userStatus = u.UserRSVPStatus || u.userRSVPStatus || u.rsvpStatus || 'Unknown';
              const userId = u.UserId || u.userId || u.id || u.Id || `unknown-${idx}`;
              
              
              if (userStatus === 'Unknown' && mahalleUsers.length > 1) {
                return null;
              }
              
              return (
                <li key={userId} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#eaf6ef', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.98rem', color: '#18813a' }}>
                    {(userName || '?')[0]}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: '.97rem', color: '#222' }}>{userName}</span>
                  <span style={{ marginLeft: 8, color: userStatus === 'Attending' ? '#18813a' : userStatus === 'Interested' ? '#eab308' : userStatus === 'Declined' ? '#c00' : '#888', fontWeight: 500 }}>
                    {userStatus === 'Attending' ? 'Katılıyor' : userStatus === 'Interested' ? 'İlgileniyor' : userStatus === 'Declined' ? 'Katılamaz' : 'Belirsiz'}
                  </span>
                </li>
              );
            }).filter(Boolean)}
          </ul>
        ) : (
          <div style={{ color: '#666', fontStyle: 'italic' }}>Henüz katılım bilgisi yok</div>
        )}
      </div>
    </div>
  );
}
