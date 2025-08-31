import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { normalizeProfilePictureUrl } from '../utils/profilePicture';
import { useApi } from '../context/ApiContext';
import { useNavigate } from 'react-router-dom';
import useUserActivity from '../hooks/useUserActivity';
import useNow from '../hooks/useNow';


export default function UserMenu() {
  const { user, logout } = useAuth();
  const { client } = useApi();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const firstName = user?.name || user?.firstName || user?.ad || '';
  const lastName = user?.surname || user?.lastName || user?.soyad || '';
  
  let displayName = '';
  if (firstName && lastName) displayName = `${firstName} ${lastName}`;
  else if (firstName) displayName = firstName;
  else if (user?.username) displayName = user.username;
  else if (user?.email) displayName = user.email;
  else if (user?.id) displayName = `ID: ${user.id}`;
  else displayName = 'Kullanıcı';
  
  
  const neighborhoodId = user?.neighborhoodId || user?.neighborhoodID || user?.mahalleId || user?.mahalleID || user?.NeighborhoodId || user?.MahalleId || user?.neighborhood?.id || user?.mahalle?.id;
  const [neighborhoodName, setNeighborhoodName] = useState('');

  useEffect(() => {
    if (!neighborhoodId || !client) {
      setNeighborhoodName('');
      return;
    }
    let mounted = true;
    client.get(`/neighborhood/${neighborhoodId}`)
      .then(res => {
        if (!mounted) return;
        setNeighborhoodName(res.data.neighbourhood || res.data.name || '');
      })
      .catch(() => { if (mounted) setNeighborhoodName(''); });
    return () => { mounted = false; };
  }, [neighborhoodId, client]);

  const neighborhood = user?.neighborhood || user?.neighborhoodName || user?.district || user?.mahalle || neighborhoodName || '';
  const initial = (firstName || user?.username || user?.email || 'S').charAt(0).toUpperCase();
  const rawProfilePictureUrl = user?.profilePictureUrl || user?.profilePicture || user?.ProfilePictureUrl || user?.ProfilePicture;
  const profilePictureUrl = normalizeProfilePictureUrl(rawProfilePictureUrl);
  console.log('UserMenu profilePictureUrl:', profilePictureUrl);
  const { data: activity } = useUserActivity([user?.id]);
  const now = useNow(30000);

  useEffect(() => {
    function handleClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleProfile(e) {
    e.preventDefault();
    setOpen(false);
    navigate('/profile'); 
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="user-menu-wrapper" ref={ref}>
      <button className="user-menu-trigger nav-icon" onClick={() => setOpen(o => !o)} aria-haspopup="true" aria-expanded={open}>
        <div className="user-avatar-circle">
          {profilePictureUrl ? (
            <img src={profilePictureUrl} alt="Profil" className="user-avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="user-avatar" aria-hidden>{initial}</div>
          )}
        </div>
        <span className="user-menu-caret" />
      </button>
      {open && (
        <div className="user-dropdown" role="menu">
          <div className="user-dropdown-header">
            {profilePictureUrl ? (
              <img src={profilePictureUrl} alt="Profil" className="user-avatar large" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
            ) : (
              <div className="user-avatar large" aria-hidden>{initial}</div>
            )}
            <div className="user-ident">
              <div className="user-full-name">{displayName}</div>
              {neighborhood && <div className="user-neighborhood">{neighborhood}</div>}
              <div style={{ fontSize: 12, color: activity?.[String(user?.id)]?.isOnline ? '#14963a' : '#666', marginTop: 6 }}>
                {(() => {
                  const raw = activity?.[String(user?.id)] || { isOnline: false, lastSeen: null, lastSeenText: '' };
                  let display = raw.isOnline ? 'Çevrimiçi' : 'Çevrimdışı';
                  if (!raw.isOnline && raw.lastSeen) {
                    const last = new Date(raw.lastSeen);
                    const diff = Math.floor((now - last.getTime()) / 1000);
                    if (diff < 60) display = 'şimdi';
                    else if (diff < 3600) display = `${Math.floor(diff / 60)} dakika önce`;
                    else if (diff < 3600 * 24) display = `${Math.floor(diff / 3600)} saat önce`;
                    else display = last.toLocaleString();
                  }
                  return display;
                })()}
              </div>
            </div>
          </div>
          <button className="user-dropdown-action primary" onClick={handleProfile}>Profili görüntüle</button>
          <div className="user-dropdown-divider" />
          <button className="user-dropdown-action with-icon danger" onClick={handleLogout}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Çıkış yap</span>
          </button>
        </div>
      )}
    </div>
  );
}
