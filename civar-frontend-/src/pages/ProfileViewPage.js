import React from "react";
import "./ProfileViewPage.css";
import { FaBell, FaRegCommentDots, FaRegUser, FaRegEdit, FaPlus, FaRegBuilding } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { normalizeProfilePictureUrl } from "../utils/profilePicture";
import { useEffect, useState } from "react";
import useUserActivity from "../hooks/useUserActivity";
import useNow from "../hooks/useNow";
import logo from "../assets/civar-logo.png";
export default function ProfileViewPage() {
  const { user } = useAuth();
  const { client } = useApi();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  
  const neighborhoodId = profileUser?.neighborhoodId || profileUser?.neighborhoodID || profileUser?.mahalleId || profileUser?.mahalleID || profileUser?.NeighborhoodId || profileUser?.MahalleId || profileUser?.neighborhood?.id || profileUser?.mahalle?.id;
  const [neighborhoodName, setNeighborhoodName] = useState('');
  const neighborhood = neighborhoodName || profileUser?.neighborhood || profileUser?.neighborhoodName || profileUser?.district || "Mahalle";
  const { data: activityMap } = useUserActivity(userId ? [userId] : [user?.id]);
  const now = useNow(30000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    
    if (userId) {
      setLoading(true);
      client.get(`/user/${userId}`)
        .then(res => setProfileUser(res.data))
        .catch(() => setProfileUser(null))
        .finally(() => setLoading(false));
    } else {
      
      
      const myId = user?.id || user?._id;
      if (!myId) {
        setProfileUser(user);
        return;
      }
      setLoading(true);
      client.get(`/user/${myId}`)
        .then(res => setProfileUser(res.data))
        .catch(() => setProfileUser(user))
        .finally(() => setLoading(false));
    }
  }, [userId, client, user]);

  
  useEffect(() => {
    if (!neighborhoodId || !client) {
      setNeighborhoodName('');
      return;
    }
    client.get(`/neighborhood/${neighborhoodId}`)
      .then(res => setNeighborhoodName(res.data.neighbourhood || res.data.name || ''))
      .catch(() => setNeighborhoodName(''));
  }, [neighborhoodId, client]);

  const ad = profileUser?.name || profileUser?.firstName || profileUser?.ad || profileUser?.first_name || "";
  const soyad = profileUser?.surname || profileUser?.lastName || profileUser?.soyad || profileUser?.last_name || "";
  const initial = (ad || profileUser?.username || profileUser?.email || "S").charAt(0).toUpperCase();

  
  function normalizeProfilePictureUrl(url) {
    if (!url) return null;
    
  if (/^https?:\/\//.test(url))
    
    if (url.startsWith('/')) return process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL + url : url;
    
    return url;
  }
  const rawProfilePictureUrl = profileUser?.profilePictureUrl || profileUser?.profilePicture || profileUser?.ProfilePictureUrl || profileUser?.ProfilePicture;
  const profilePictureUrl = normalizeProfilePictureUrl(rawProfilePictureUrl);
  console.log('ProfileViewPage profilePictureUrl:', profilePictureUrl);

  if (loading) return <div style={{padding:32, textAlign:'center'}}>Profil yükleniyor...</div>;
  if (!profileUser) return <div style={{padding:32, textAlign:'center', color:'crimson'}}>Kullanıcı bulunamadı.</div>;

  
  if (userId) {
  const actRaw = activityMap?.[String(userId)] || activityMap?.[String(profileUser?.id)] || { isOnline: false, lastSeen: null, lastSeenText: '' };
  let act = { ...actRaw };
  if (actRaw.lastSeen) {
    const last = new Date(actRaw.lastSeen);
    const diff = Math.floor((now - last.getTime()) / 1000);
    if (diff < 60) act.lastSeenText = 'şimdi';
    else if (diff < 3600) act.lastSeenText = `${Math.floor(diff / 60)} dakika önce`;
    else if (diff < 86400) act.lastSeenText = `${Math.floor(diff / 3600)} saat önce`;
    else if (diff < 86400 * 30) act.lastSeenText = `${Math.floor(diff / 86400)} gün önce`;
    else act.lastSeenText = new Date(actRaw.lastSeen).toLocaleString();
  }

    return (
      <div style={{
        maxWidth: 520,
        margin: '48px auto',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, width: '100%' }}>
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt="Profil"
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#eaf6ef',
                boxShadow: '0 2px 8px rgba(24,129,58,0.06)'
              }}
            />
          ) : (
            <div style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: '#eaf6ef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              fontWeight: 700,
              color: '#18813a',
              boxShadow: '0 2px 8px rgba(24,129,58,0.06)'
            }}>{initial}</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:22, fontWeight:700, color:'#18813a' }}>{ad} {soyad}</div>
                <div style={{ fontSize:14, color:'#666', marginTop:6 }}>{profileUser?.username || profileUser?.userName || profileUser?.email || ''}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:18, background: act.isOnline ? '#e7f8ee' : '#fafafa', border: act.isOnline ? '1px solid rgba(20,150,58,0.12)' : '1px solid #f1f1f1' }}>
                  <span style={{width:10,height:10, borderRadius:'50%', background: act.isOnline ? '#14963a' : '#cfcfcf', boxShadow: act.isOnline ? '0 0 6px rgba(20,150,58,0.18)' : 'none'}}></span>
                  <span style={{ fontSize:13, color: act.isOnline ? '#14963a' : '#888', fontWeight:600 }}>{act.isOnline ? 'Çevrimiçi' : (act.lastSeenText ? `Son: ${act.lastSeenText}` : 'Çevrimdışı')}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop:12, color:'#666', display:'flex', alignItems:'center', gap:10 }}>
              <FaRegBuilding style={{ color:'#9aa', marginRight:4 }} />
              <span style={{ fontSize:14 }}>{neighborhood}</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: 18, display:'flex', gap:10, justifyContent:'center' }}>
          <button
            onClick={() => navigate(`/chat/${profileUser?.id || userId}`)}
            style={{ background:'#18813a', color:'#fff', border:'none', padding:'10px 16px', borderRadius:8, fontWeight:600, cursor:'pointer' }}
            title="Mesaj Gönder"
          >
            <FaRegCommentDots style={{ marginRight:8 }} /> Mesaj Gönder
          </button>
          {}
        </div>

        <div style={{ width: '100%', borderTop: '1px solid #f1f1f1', marginTop: 22, paddingTop: 18 }}>
          <div style={{ color: '#444', fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Hakkında</div>
          <div style={{ color: '#555', fontSize: 15, minHeight: 32, lineHeight: 1.5 }}>
            {profileUser?.bio || profileUser?.biography || profileUser?.about || <span style={{ color: '#aaa' }}>Henüz biyografi eklenmemiş.</span>}
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="profile-container">
      <div className="profile-content-wrapper">
        <div className="profile-header">
          <div className="profile-bg"></div>
          <div className="profile-avatar">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profil"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '6px solid #fff',
                  boxShadow: '0 2px 8px rgba(24,129,58,0.10)',
                  background: '#eaf6ef',
                  display: 'block'
                }}
              />
            ) : (
              <span className="avatar-circle">{initial}</span>
            )}
          </div>
          <div className="profile-info">
            <h2>
              {ad} {soyad?.charAt(0)?.toUpperCase()}.
              <small style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: '#666' }}>
                {(activityMap?.[String(user?.id)]?.isOnline) ? 'Çevrimiçi' : (activityMap?.[String(user?.id)]?.lastSeenText ? `Son: ${activityMap[String(user.id)].lastSeenText}` : 'Çevrimdışı')}
              </small>
            </h2>
            <div className="profile-location"><FaRegUser style={{marginRight:4}} /> {neighborhood}</div>
            <div style={{marginTop:12}}>
              <button className="edit-btn" onClick={() => navigate('/settings/account') }><FaRegEdit style={{marginRight:6}} /> Profili Düzenle</button>
            </div>
          </div>
        </div>
        
        {}
        <div className="profile-bio">
          <div className="bio-header">
            <h3>Hakkında</h3>
          </div>
          <div className="bio-content">
            {profileUser?.bio || profileUser?.biography || profileUser?.about || 
              <span className="bio-empty">Henüz biyografi eklenmemiş. Profil ayarlarından biyografi ekleyebilirsiniz.</span>
            }
          </div>
        </div>
        
    {}
      </div>
    </div>
  );
}
