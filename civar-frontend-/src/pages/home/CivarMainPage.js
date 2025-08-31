import { normalizeProfilePictureUrl } from '../../utils/profilePicture';
import './CivarMainPage.css';
import { useAuth } from '../../context/AuthContext';
import UserMenu from '../../components/UserMenu';
import CivarPostShareBox from './CivarPostShareBox';
import CivarEventShareBox from './CivarEventShareBox';
import UpcomingCountdowns from '../../components/UpcomingCountdowns';
import { useApi } from '../../context/ApiContext';
import { useState, useEffect } from 'react';
import useUserActivity from '../../hooks/useUserActivity';
import useNow from '../../hooks/useNow';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationBadge from '../../components/NotificationBadge';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

export default function CivarMainPage() {
  const { user, loading } = useAuth();
  const { client } = useApi();
  const queryClient = useQueryClient();
  const [mahalleUsers, setMahalleUsers] = useState([]);
  const [mahalleUsersLoading, setMahalleUsersLoading] = useState(false);
  const [mahalleUsersError, setMahalleUsersError] = useState(null);

  
  const neighborhoodId = 
    user?.neighborhoodId || user?.neighborhoodID || user?.mahalleId || user?.mahalleID || 
    user?.NeighborhoodId || user?.MahalleId || user?.neighborhood?.id || user?.mahalle?.id;

  console.log('CivarMainPage - user:', user);
  console.log('CivarMainPage - neighborhoodId:', neighborhoodId);

  const [postTypeFilter, setPostTypeFilter] = useState(undefined); 
  const POST_TYPE_LABELS = ['Genel', 'Duyuru', 'Hizmet Talebi', 'Kayıp Eşya', 'Etkinlik', 'Satılık', 'Tavsiye', 'Şüpheli Durum'];

  
  const { data: posts = [], isLoading: postsLoading, error: postsError, refetch: refetchPosts } = useQuery({
    queryKey: ['posts', postTypeFilter, neighborhoodId], 
    queryFn: async () => {
      console.log('CivarMainPage API isteği gönderiliyor, neighborhoodId:', neighborhoodId);
      
      let res;
      try {
        
        const params = {};
        if (neighborhoodId) params.neighborhoodId = neighborhoodId;
        if (postTypeFilter !== undefined && postTypeFilter !== null) params.type = postTypeFilter;
        if (Object.keys(params).length) {
          res = await client.get('/post', { params });
        } else {
          res = await client.get('/post');
        }
      } catch (err) {
        console.error('CivarMainPage Post API hatası:', err);
        if (neighborhoodId) {
          console.warn('CivarMainPage - neighborhoodId ile hata alındı, tüm postları çekiliyor...');
          res = await client.get('/post');
        } else {
          throw err;
        }
      }
      
      let posts = res.data;
      console.log('CivarMainPage API yanıtı (posts):', posts);
      
      if (!Array.isArray(posts)) {
        console.warn('CivarMainPage - Posts array değil:', posts);
        posts = [];
      }
      
      
      posts = posts.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.createdDate || a.dateCreated);
        const dateB = new Date(b.createdAt || b.createdDate || b.dateCreated);
        return dateB.getTime() - dateA.getTime();
      });
      
      return posts;
    },
    enabled: !!client && !!neighborhoodId,
    staleTime: 0, 
    cacheTime: 1000 * 60 * 5, 
  });
  
  useEffect(() => {
    async function fetchMahalleUsers() {
      if (!neighborhoodId) return;
      setMahalleUsersLoading(true);
      setMahalleUsersError(null);
      try {
        const res = await client.get(`/user?neighborhoodId=${neighborhoodId}`);
        setMahalleUsers(res.data);
      } catch (err) {
        setMahalleUsersError('Mahalle kullanıcıları yüklenemedi.');
      } finally {
        setMahalleUsersLoading(false);
      }
    }
    fetchMahalleUsers();
  }, [client, neighborhoodId]);
  
  const mahalleUserIds = mahalleUsers.map(u => u.id || u.userId).filter(Boolean);
  const { data: mahalleActivity = {}, isLoading: mahalleActivityLoading } = useUserActivity(mahalleUserIds);
  const now = useNow(30000); 
  const navigate = useNavigate();
  const location = useLocation();
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [paylasiliyor, setPaylasiliyor] = useState(false);
  const [paylasHata, setPaylasHata] = useState(null);
  const ad = user?.name || user?.firstName || user?.ad || '';
  const soyad = user?.surname || user?.lastName || user?.soyad || '';
  const [activeTab, setActiveTab] = useState('feed');
  const navigateTo = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  
  const getPostAuthorId = (post) => {
    const id = post?.userId || post?.UserId || post?.user?.id || post?.User?.id || post?.user?.userId || post?.User?.userId || post?.authorId || post?.author?.id || post?.createdBy || post?.createdById;
    return id ? String(id) : null;
  };

  
  const myIdForFilter = (user?.id || user?.userId) ? String(user.id || user.userId) : null;
  const filteredPosts = Array.isArray(posts) && myIdForFilter ? posts.filter(post => {
    const postAuthorId = getPostAuthorId(post);
    const match = postAuthorId && myIdForFilter === postAuthorId;
    console.log('Post filter debug:', { 
      postId: post.id, 
      postAuthorId, 
      myIdForFilter, 
      match,
      postRaw: { userId: post.userId, UserId: post.UserId }
    });
    return match;
  }) : [];
  
  console.log('My posts filtering:', { 
    activeTab, 
    totalPosts: posts.length, 
    myFilteredPosts: filteredPosts.length, 
    myIdForFilter,
    userRaw: { id: user?.id, userId: user?.userId }
  });

  
  const displayPostsUnfiltered = (activeTab === 'my-posts' ? filteredPosts : posts) || [];
  const displayPosts = (postTypeFilter === undefined || postTypeFilter === null) ? displayPostsUnfiltered : displayPostsUnfiltered.filter(p => Number(p.type) === Number(postTypeFilter));

  const handleShare = async (args) => {
    if (!user) return;
    setPaylasiliyor(true);
    setPaylasHata(null);
    try {
      const dto = {
        title: args.title,
        content: args.content,
        type: args.kategori,
        location: '',
        neighborhoodId: (args.mahalleId || neighborhoodId)?.toString(),
      };
      
      console.log('CivarMainPage - Yeni post paylaşılıyor:', dto);
      await client.post(`/post?userId=${user.id || user.userId}`, dto);
      
      
      console.log('CivarMainPage - Cache invalidating...');
      queryClient.invalidateQueries({queryKey: ['posts']});
      refetchPosts();
      
      console.log('CivarMainPage - Post paylaşıldı, cache invalidated');
    } catch (err) {
      let hata = 'Gönderi paylaşılamadı.';
      const data = err?.response?.data;
      if (data?.message) hata = data.message;
      else if (typeof data === 'string') hata = data;
      else if (data?.errors) hata = Object.values(data.errors).flat().join(' ');
      setPaylasHata(hata);
    } finally {
      setPaylasiliyor(false);
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };
  const cancelEdit = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditContent('');
  };
  const saveEdit = async (post) => {
    try {
      await client.put(`/post/${post.id}?userId=${user.id || user.userId}`, { ...post, title: editTitle, content: editContent });
      
      queryClient.invalidateQueries({queryKey: ['posts']});
      refetchPosts();
      cancelEdit();
    } catch (err) {
      alert('Düzenleme başarısız!');
    }
  };

  if (loading || !user || !ad || !soyad) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem' }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="civar-main-container" style={{ overflowX: 'hidden', overflowY: 'auto' }}>
      {}
      <aside className="civar-sidebar">
        <div className="civar-logo-area">
          <img src={require('../../assets/civar-logo.png')} alt="Civar Logo" className="civar-main-logo" />
          <span className="civar-logo-text">Civar</span>
        </div>
        <nav className="civar-menu">
          <ul>
            <li
              style={{ cursor: 'pointer', fontWeight: location.pathname === '/ana-sayfa' ? 700 : 400, color: location.pathname === '/ana-sayfa' ? '#18813a' : undefined }}
              onClick={() => { setActiveTab('feed'); navigate('/ana-sayfa'); }}
            >
              Ana Sayfa
            </li>
            <li
              style={{ cursor: 'pointer', fontWeight: location.pathname.startsWith('/events') ? 700 : 400, color: location.pathname.startsWith('/events') ? '#18813a' : undefined }}
              onClick={() => { setActiveTab('feed'); navigate('/events'); }}
            >
              Etkinlikler
            </li>
            <li
              style={{ cursor: 'pointer', fontWeight: activeTab === 'my-posts' ? 700 : 400, color: activeTab === 'my-posts' ? '#18813a' : undefined }}
              onClick={() => setActiveTab('my-posts')}
            >
              Gönderilerim
            </li>
          </ul>
        </nav>
        <div style={{margin:'20px 0'}}>
          <CivarPostShareBox onShare={handleShare} />
          {paylasiliyor && <div style={{color:'#18813a',textAlign:'center',marginTop:8}}>Paylaşılıyor...</div>}
          {paylasHata && <div style={{color:'crimson',textAlign:'center',marginTop:8}}>{paylasHata}</div>}
        </div>
        <div className="civar-sidebar-bottom">
          {}
        </div>
      </aside>
      {}
      <main className="civar-feed" style={{position:'relative', overflowY: 'auto'}}>
        <div style={{position:'absolute',top:24,right:24,zIndex:10,minWidth:320,maxWidth:370}}>
          <CivarEventShareBox />
          <div style={{marginTop:12}}>
            <UpcomingCountdowns limit={6} lookaheadDays={2} neighborhoodId={neighborhoodId} />
          </div>
          {}
          <div style={{marginTop:16, background:'#fff', border:'1.5px solid #eaf6ef', borderRadius:14, boxShadow:'0 2px 12px rgba(24,129,58,0.07)', padding:'12px 14px', minHeight:60, maxHeight:220, overflowY:'auto'}}>
            <div style={{fontWeight:600, color:'#18813a', fontSize:'1.07rem', marginBottom:6}}>Mahallenizdeki Kullanıcılar</div>
            {mahalleUsersLoading ? (
              <div style={{color:'#888'}}>Yükleniyor...</div>
            ) : mahalleUsersError ? (
              <div style={{color:'crimson'}}>{mahalleUsersError}</div>
            ) : mahalleUsers.length === 0 ? (
              <div style={{color:'#aaa', fontSize:'.97rem'}}>Kullanıcı bulunamadı.</div>
            ) : (
              <ul style={{listStyle:'none',margin:0,padding:0}}>
                {mahalleUsers.map(u => {
                  const myId = (user.id || user.userId)?.toString();
                  const uId = (u.id || u.userId)?.toString();
                  const isMe = myId && uId && myId === uId;
                  const activityRaw = mahalleActivity?.[String(uId)] || { isOnline: false, lastSeen: null, lastSeenText: '' };
                  
                  let activity = { ...activityRaw };
                  if (activityRaw.lastSeen) {
                        const last = new Date(activityRaw.lastSeen);
                        const diff = Math.floor((now - last.getTime()) / 1000);
                        if (diff < 60) activity.lastSeenText = 'şimdi';
                        else if (diff < 3600) activity.lastSeenText = `${Math.floor(diff / 60)} dk önce`;
                        else if (diff < 86400) activity.lastSeenText = `${Math.floor(diff / 3600)} saat önce`;
                        else if (diff < 86400 * 30) activity.lastSeenText = `${Math.floor(diff / 86400)} gün önce`;
                        else activity.lastSeenText = last.toLocaleString();
                  }
                  
                  const rawProfilePictureUrl = u.profilePictureUrl || u.profilePicture || u.ProfilePictureUrl || u.ProfilePicture;
                  const profilePictureUrl = normalizeProfilePictureUrl(rawProfilePictureUrl);
                  console.log('CivarMainPage mahalleUser profilePictureUrl:', profilePictureUrl);
                  const initial = (u.name || u.firstName || u.ad || '?')[0];
                  return (
                    <li key={u.id || u.userId} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt="Profil"
                          style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',background:'#eaf6ef',boxShadow:'0 1px 4px #0001'}}
                        />
                      ) : (
                        <span style={{width:32,height:32,borderRadius:'50%',background:'#eaf6ef',display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1.1rem',color:'#18813a',boxShadow:'0 1px 4px #0001'}}>
                          {initial}
                        </span>
                      )}
                      <span style={{width:10,height:10, borderRadius:'50%', marginLeft:4, marginRight:2, background: activity.isOnline ? '#14963a' : '#cfcfcf', boxShadow: activity.isOnline ? '0 0 6px rgba(20,150,58,0.25)' : 'none'}} title={activity.isOnline ? 'Çevrimiçi' : (activity.lastSeenText ? `Son: ${activity.lastSeenText}` : 'Çevrimdışı')}></span>
                      <span style={{fontWeight:500,fontSize:'.97rem',color:'#222'}}>{u.name || u.firstName || u.ad || 'Kullanıcı'} {u.surname || u.lastName || u.soyad || ''}</span>
                      {activity.lastSeenText && !activity.isOnline && (
                        <span style={{fontSize:11,color:'#666',marginLeft:8}}>{activity.lastSeenText}</span>
                      )}
                      {!isMe && (
                        <button
                          style={{marginLeft:4,background:'#eaf6ef',border:'none',borderRadius:'50%',padding:'4px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
                          title="Mesaj Gönder"
                          onClick={() => navigateTo(`/chat/${u.id || u.userId}`)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#18813a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        <div className="civar-search-bar">
            <div style={{position:'relative'}} ref={searchRef}>
              <input
                type="text"
                placeholder="Civar'da ara..."
                value={searchQuery}
                onChange={e => {
                  const v = e.target.value;
                  setSearchQuery(v);
                  if (v && v.trim().length >= 2) setShowSearch(true);
                  else setShowSearch(false);
                  
                  if (v && v.trim().length >= 2) {
          const q = v.trim().toLowerCase();
          const postMatches = Array.isArray(posts) ? posts.filter(p => ((p.title || '') + ' ' + (p.content || '')).toLowerCase().includes(q)).slice(0,6).map(p => ({ type: 'post', id: p.id, title: p.title })) : [];
          const userMatches = Array.isArray(mahalleUsers) ? mahalleUsers.filter(u => ((u.name || u.firstName || u.ad || '') + ' ' + (u.surname || u.lastName || u.soyad || '')).toLowerCase().includes(q)).slice(0,6).map(u => ({
            type: 'user',
            id: u.id || u.userId,
            name: (u.name || u.firstName || u.ad || '') + ' ' + (u.surname || u.lastName || u.soyad || ''),
            profilePictureUrl: u.profilePictureUrl || u.profilePicture || u.ProfilePictureUrl || u.ProfilePicture
          })) : [];
          setSearchResults([...userMatches, ...postMatches].slice(0,8));
                  } else {
                    setSearchResults([]);
                  }
                }}
                onFocus={() => { if (searchQuery && searchQuery.trim().length >= 2) setShowSearch(true); }}
                onKeyDown={e => {
                  if (e.key === 'Escape') { setShowSearch(false); }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (searchResults.length > 0) {
                      const first = searchResults[0];
                      if (first.type === 'post') navigateTo(`/posts/${first.id}`);
                      else if (first.type === 'user') navigateTo(`/profile/${first.id}`);
                      setShowSearch(false);
                    } else if (searchQuery.trim()) {
                      
                      navigateTo(`/posts?search=${encodeURIComponent(searchQuery.trim())}`);
                      setShowSearch(false);
                    }
                  }
                }}
                style={{width:260, padding:'8px 10px', borderRadius:20, border:'1px solid #eaf6ef'}}
              />
              {showSearch && searchResults.length > 0 && (
                <div style={{position:'absolute', top:38, left:0, width:320, maxHeight:280, overflowY:'auto', background:'#fff', border:'1px solid #eaf6ef', boxShadow:'0 6px 18px rgba(0,0,0,0.06)', borderRadius:8, zIndex:40}}>
                  {searchResults.map((r, idx) => (
                    <div key={String(r.type) + '_' + String(r.id) + '_' + idx} onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                      if (r.type === 'post') navigateTo(`/posts/${r.id}`);
                      else if (r.type === 'user') navigateTo(`/profile/${r.id}`);
                    }} style={{padding:'8px 12px', cursor:'pointer', borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid #f1f1f1'}}>
                        {r.type === 'post' ? (
                          <div style={{fontSize:13, color:'#18813a', fontWeight:600}}>{r.title || 'Gönderi'}</div>
                        ) : (
                          <div style={{display:'flex', alignItems:'center', gap:10}}>
                            {r.profilePictureUrl ? (
                              <img
                                src={normalizeProfilePictureUrl(r.profilePictureUrl)}
                                alt="Profil"
                                style={{width:28,height:28,borderRadius:'50%',objectFit:'cover',background:'#eaf6ef',boxShadow:'0 1px 4px #0001'}}
                              />
                            ) : (
                              <span style={{width:28,height:28,borderRadius:'50%',background:'#eaf6ef',display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1rem',color:'#18813a',boxShadow:'0 1px 4px #0001'}}>
                                {r.name?.[0] || '?'}
                              </span>
                            )}
                            <div style={{fontSize:13, color:'#222'}}>{r.name}</div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          <div className="civar-top-icons">
            <NotificationBadge icon={
              <button className="top-icon" aria-label="Bildirimler" style={{background:'none',border:'none',padding:0}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="22" height="22">
                  <path d="M12 22a2.8 2.8 0 01-2.8-2.8h5.6A2.8 2.8 0 0112 22z" />
                  <path d="M4.5 16.2h15.1c-.7-.9-1.1-2-1.1-3.2V9.4a6.5 6.5 0 00-13 0v3.6c0 1.2-.4 2.3-1.1 3.2z" />
                </svg>
              </button>
            } />
            <button className="top-icon" aria-label="Mesajlar" onClick={() => navigate('/chat')} title="Mesajlar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="22" height="22">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <UserMenu />
          </div>
        </div>
        <div className="civar-main-cards">
          <div className="civar-welcome-card">
            <h2>Hoş geldin, {ad} {soyad}!</h2>
          </div>
          <div style={{marginTop:12, marginBottom:4, display:'flex', justifyContent:'center'}}>
            <div style={{
              display:'inline-flex', 
              gap:2, 
              alignItems:'center', 
              background:'#f8f9fa', 
              padding:'4px', 
              borderRadius:20, 
              boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
              border:'1px solid #e9ecef'
            }}>
              <button 
                onClick={() => { setPostTypeFilter(undefined); queryClient.invalidateQueries({queryKey:['posts']}); refetchPosts(); }} 
                style={{
                  padding:'6px 14px', 
                  borderRadius:16, 
                  border:'none', 
                  background: postTypeFilter===undefined ? 'linear-gradient(135deg, #18813a, #20a047)' : 'transparent',
                  color: postTypeFilter===undefined ? '#fff' : '#555',
                  cursor:'pointer',
                  fontSize:12,
                  fontWeight:500,
                  transition:'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline:'none',
                  boxShadow: postTypeFilter===undefined ? '0 2px 6px rgba(24,129,58,0.2)' : 'none'
                }}
                onMouseEnter={e => {
                  if (postTypeFilter !== undefined) {
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={e => {
                  if (postTypeFilter !== undefined) {
                    e.target.style.background = 'transparent';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                Tümü
              </button>
              {POST_TYPE_LABELS.map((lbl, idx) => (
                <button 
                  key={lbl} 
                  onClick={() => { setPostTypeFilter(idx); queryClient.invalidateQueries({queryKey:['posts']}); refetchPosts(); }} 
                  style={{
                    padding:'6px 14px', 
                    borderRadius:16, 
                    border:'none', 
                    background: postTypeFilter===idx ? 'linear-gradient(135deg, #18813a, #20a047)' : 'transparent',
                    color: postTypeFilter===idx ? '#fff' : '#555',
                    cursor:'pointer',
                    fontSize:12,
                    fontWeight:500,
                    transition:'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline:'none',
                    boxShadow: postTypeFilter===idx ? '0 2px 6px rgba(24,129,58,0.2)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (postTypeFilter !== idx) {
                      e.target.style.background = '#fff';
                      e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (postTypeFilter !== idx) {
                      e.target.style.background = 'transparent';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginTop:2}}>
            {postsLoading ? (
              <div style={{textAlign:'center',color:'#18813a'}}>Gönderiler yükleniyor...</div>
            ) : postsError ? (
              <div style={{textAlign:'center',color:'crimson'}}>
                <div>Hata: {postsError.message || postsError}</div>
                <button 
                  onClick={() => {
                    console.log('Manual refresh clicked');
                    queryClient.invalidateQueries({queryKey: ['posts']});
                    refetchPosts();
                  }}
                  style={{marginTop: '10px', padding: '8px 16px', backgroundColor: '#179c5a', color: 'white', border: 'none', borderRadius: '4px'}}
                >
                  Yenile
                </button>
              </div>
            ) : !neighborhoodId ? (
              <div style={{textAlign:'center',color:'crimson'}}>Mahalle bilgisi bulunamadı. Lütfen profilinizden mahalle seçin.</div>
            ) : (
              (activeTab === 'my-posts' ? filteredPosts : posts).length === 0 ? null : (
                displayPosts.map((post) => {
                  const userName = post.UserName || post.userName || post.ad || post.name || 'Kullanıcı';
                  const userSurname = post.UserSurname || post.userSurname || post.soyad || post.surname || post.lastName || '';
                  const neighborhoodName =
                    post.neighborhoodName || post.Neighborhood || post.neighborhood ||
                    (post.neighborhoodId ? `Mahalle #${post.neighborhoodId}` : 'Mahalle Bilgisi Yok');
                  let createdStr = '';
                  const dateFields = [post.createdAt, post.CreatedAt, post.updatedAt, post.UpdatedAt];
                  for (const dt of dateFields) {
                    if (dt && dt !== '0001-01-01T00:00:00') {
                      createdStr = new Date(dt).toLocaleString('tr-TR');
                      break;
                    }
                  }
                  if (!createdStr) createdStr = 'Tarih yok';
                  const updatedStr =
                    (post.updatedAt || post.UpdatedAt) && (post.updatedAt || post.UpdatedAt) !== '0001-01-01T00:00:00'
                      ? new Date(post.updatedAt || post.UpdatedAt).toLocaleString('tr-TR')
                      : '';
                  const myId = (user.id || user.userId)?.toString();
                  const postId = (post.userId || post.UserId)?.toString();
                  const isMyPost = myId && postId && myId === postId;
                  const isEditing = editingPostId === post.id;
                  return (
                    <div key={post.id} className="civar-feed-card" style={{
                      marginBottom: 24,
                      borderRadius: 16,
                      boxShadow: '0 2px 12px rgba(24,129,58,0.07)',
                      padding: '28px 32px',
                      background: '#fff',
                      maxWidth: 800,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      border: '1.5px solid #eaf6ef',
                      position: 'relative'
                    }}>
                      <button
                        style={{ position: 'absolute', top: 18, right: 18, background: '#eaf6ef', color: '#18813a', border: 'none', borderRadius: 8, padding: '4px 14px', fontWeight: 500, cursor: 'pointer', fontSize: '.97rem', zIndex: 2 }}
                        onClick={() => navigate(`/posts/${post.id}`)}
                        title="Detay sayfasına git"
                      >
                        Detay
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: '#eaf6ef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.2rem',
                          color: '#18813a',
                          marginRight: 12
                        }}>
                          {userName[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1.08rem', color: '#18813a' }}>{userName} {userSurname}</div>
                          <div style={{ fontSize: '.97rem', color: '#4b6e57' }}>{neighborhoodName}</div>
                        </div>
                        {isMyPost && (
                          <div style={{marginLeft:16,display:'flex',gap:8}}>
                            {deletingPostId === post.id ? (
                              <>
                                <span style={{color:'#c00',fontWeight:500,marginRight:8}}>Silinsin mi?</span>
                                <button style={{background:'#c00',color:'#fff',border:'none',borderRadius:6,padding:'2px 10px',cursor:'pointer'}} onClick={async () => {
                                  try {
                                    await client.delete(`/post/${post.id}?userId=${user.id || user.userId}`);
                                    
                                    queryClient.invalidateQueries({queryKey: ['posts']});
                                    refetchPosts();
                                    setDeletingPostId(null);
                                  } catch (err) {
                                    alert('Silme işlemi başarısız!');
                                    setDeletingPostId(null);
                                  }
                                }}>Evet</button>
                                <button style={{background:'#fff',border:'1px solid #eaf6ef',color:'#888',borderRadius:6,padding:'2px 10px',cursor:'pointer'}} onClick={() => setDeletingPostId(null)}>Vazgeç</button>
                              </>
                            ) : (
                              <>
                                <button style={{background:'#fff',border:'1px solid #eaf6ef',color:'#c00',borderRadius:6,padding:'2px 10px',cursor:'pointer'}} onClick={() => setDeletingPostId(post.id)}>Sil</button>
                                {isEditing ? (
                                  <>
                                    <button style={{background:'#fff',border:'1px solid #eaf6ef',color:'#18813a',borderRadius:6,padding:'2px 10px',cursor:'pointer'}} onClick={() => saveEdit({ ...post, userId: user.id || user.userId })}>Kaydet</button>
                                    <button style={{background:'#fff',border:'1px solid #eaf6ef',color:'#888',borderRadius:6,padding:'2px 10px',cursor:'pointer'}} onClick={cancelEdit}>İptal</button>
                                  </>
                                ) : (
                                  <button style={{background:'#fff',border:'1px solid #eaf6ef',color:'#18813a',borderRadius:6,padding:'2px 10px',cursor:'pointer'}} onClick={() => startEdit(post)}>Düzenle</button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {isEditing ? (
                        <>
                          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{width:'100%',marginBottom:8,padding:6,fontSize:'1.08rem',borderRadius:6,border:'1px solid #eaf6ef'}} />
                          <textarea value={editContent} onChange={e => setEditContent(e.target.value)} style={{width:'100%',minHeight:60,marginBottom:8,padding:6,fontSize:'1.07rem',borderRadius:6,border:'1px solid #eaf6ef'}} />
                        </>
                      ) : (
                        <>
                          <div style={{ fontWeight: 600, color: '#18813a', fontSize: '1.15rem', marginBottom: 4 }}>{post.title}</div>
                          <div style={{ margin: '8px 0 16px 0', whiteSpace: 'pre-line', fontSize: '1.07rem', color: '#222', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{post.content}</div>
                        </>
                      )}
                      <div style={{ fontSize: '.97rem', color: '#666', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {post.type !== undefined && typeof post.type === 'number' ? (
                          <span style={{ marginRight: 8, padding: '2px 10px', background: '#eaf6ef', borderRadius: 8, color: '#18813a', fontWeight: 500, fontSize: '.98rem' }}>
                            {['Genel', 'Duyuru', 'Hizmet Talebi', 'Kayıp Eşya', 'Etkinlik', 'Satılık', 'Tavsiye', 'Şüpheli Durum'][post.type]}
                          </span>
                        ) : null}
                        <span style={{ color: '#888' }}>Paylaşım: {createdStr}</span>
                        {updatedStr && updatedStr !== createdStr && (
                          <span style={{ color: '#aaa' }}>Güncellendi: {updatedStr}</span>
                        )}
                      </div>
                      {}
                      <PostComments postId={post.id} client={client} user={user} />
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}



function PostComments({ postId, client, user }) {
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [confirmingCommentId, setConfirmingCommentId] = useState(null);

  const handleDelete = async (commentId) => {
    const myId = user.id || user.userId;
    console.log('Yorum silme isteği:', { commentId, userId: myId });
    setDeletingCommentId(commentId);
    try {
      await client.delete(`/post/comments/${commentId}?userId=${myId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Yorum silinemedi:', err?.response?.data || err);
      alert('Yorum silinemedi!');
    } finally {
      setDeletingCommentId(null);
    }
  };
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    client.get(`/post/${postId}/comments`).then(res => {
      if (mounted) setComments(res.data);
    }).catch(() => {
      if (mounted) setError("Yorumlar yüklenemedi.");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [postId, client]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSending(true);
    try {
      await client.post(
        `/post/${postId}/comments?userId=${user.id || user.userId}`,
        JSON.stringify(newComment),
        { headers: { 'Content-Type': 'application/json' } }
      );
      setNewComment("");
      
      const res = await client.get(`/post/${postId}/comments`);
      setComments(res.data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Yorum eklenemedi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{marginTop:18, background:'#f8faf9', borderRadius:10, padding:'12px 16px'}}>
      <div style={{fontWeight:500, color:'#18813a', marginBottom:6, fontSize:'.98rem'}}>Yorumlar</div>
      {loading ? <div style={{color:'#888'}}>Yükleniyor...</div> : error ? <div style={{color:'crimson'}}>{error}</div> : (
        comments.length === 0 ? <div style={{color:'#aaa', fontSize:'.97rem'}}>Henüz yorum yok.</div> :
        <div style={{marginBottom:8}}>
          {comments.map(c => {
            const myId = (user.id || user.userId)?.toString();
            const commentUserId = (c.userId || c.UserId)?.toString();
            const isMyComment = myId && commentUserId && myId === commentUserId;
            return (
              <div key={c.id} style={{marginBottom:7, paddingBottom:7, borderBottom:'1px solid #eaf6ef', display:'flex', alignItems:'center'}}>
                <span
                  style={{fontWeight:600, color:'#18813a', fontSize:'.97rem', cursor:'pointer', textDecoration:'underline'}}
                  onClick={() => c.userId && navigate(`/profile/${c.userId}`)}
                  title="Kullanıcı profiline git"
                >
                  {c.userName || c.userName === '' ? c.userName : 'Kullanıcı'}
                </span>:
                <span style={{color:'#222', fontSize:'.97rem'}}>{c.content}</span>
                <span style={{color:'#888', fontSize:'.93rem', marginLeft:8}}>{c.createdAt ? new Date(c.createdAt).toLocaleString('tr-TR') : ''}</span>
                {isMyComment && (
                  deletingCommentId === c.id ? (
                    <span style={{color:'#c00',marginLeft:8,fontWeight:500}}>Siliniyor...</span>
                  ) : confirmingCommentId === c.id ? (
                    <span style={{marginLeft:8, display:'flex', alignItems:'center', gap:6}}>
                      <span style={{color:'#c00',fontWeight:500}}>Silinsin mi?</span>
                      <button
                        style={{background:'#c00',color:'#fff',border:'none',borderRadius:6,padding:'2px 10px',cursor:'pointer',fontSize:'.93rem'}}
                        onClick={() => { setConfirmingCommentId(null); handleDelete(c.id); }}
                        disabled={deletingCommentId === c.id}
                      >Evet</button>
                      <button
                        style={{background:'#fff',border:'1px solid #eaf6ef',color:'#888',borderRadius:6,padding:'2px 10px',cursor:'pointer',fontSize:'.93rem'}}
                        onClick={() => setConfirmingCommentId(null)}
                        disabled={deletingCommentId === c.id}
                      >Vazgeç</button>
                    </span>
                  ) : (
                    <button
                      style={{marginLeft:8, background:'#fff', border:'1px solid #eaf6ef', color:'#c00', borderRadius:6, padding:'2px 10px', cursor:'pointer', fontSize:'.93rem'}}
                      onClick={() => setConfirmingCommentId(c.id)}
                      disabled={deletingCommentId === c.id}
                    >Sil</button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
      {user && (
        <form onSubmit={handleSend} style={{display:'flex', gap:8, marginTop:4}}>
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Yorum yaz..."
            style={{flex:1, borderRadius:6, border:'1px solid #eaf6ef', padding:'4px 8px', fontSize:'.97rem'}}
            maxLength={200}
            disabled={sending}
          />
          <button type="submit" style={{background:'#18813a', color:'#fff', border:'none', borderRadius:6, padding:'4px 14px', fontWeight:500, cursor:'pointer'}} disabled={sending}>Gönder</button>
        </form>
      )}
    </div>
  );
}
