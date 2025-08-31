
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';


export default function PostDetailPage() {
  const { id } = useParams();
  const { client } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    client.get(`/post/${id}`)
      .then(res => {
        if (mounted) {
          setData(res.data);
          setEditTitle(res.data.title || '');
          setEditContent(res.data.content || res.data.body || '');
        }
      })
      .catch(() => { if (mounted) setError('Gönderi bulunamadı.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id, client]);

  if (loading) return <div style={{textAlign:'center',marginTop:48,color:'#18813a'}}>Gönderi yükleniyor...</div>;
  if (error || !data) return <div style={{textAlign:'center',marginTop:48,color:'crimson'}}>Gönderi bulunamadı.</div>;

  
  const userName = data.UserName || data.userName || data.ad || data.name || 'Kullanıcı';
  const userSurname = data.UserSurname || data.userSurname || data.soyad || data.surname || data.lastName || '';
  
  const neighborhoodName =
    data.neighborhoodName
    || data.Neighborhood
    || data.neighborhood?.name
    || data.neighborhood
    || (data.neighborhoodId ? `Mahalle #${data.neighborhoodId}` : 'Mahalle Bilgisi Yok');
  let createdStr = '';
  const dateFields = [data.createdAt, data.CreatedAt, data.updatedAt, data.UpdatedAt, data.createdDate, data.dateCreated];
  for (const dt of dateFields) {
    if (dt && dt !== '0001-01-01T00:00:00') {
      createdStr = new Date(dt).toLocaleString('tr-TR');
      break;
    }
  }
  if (!createdStr) createdStr = 'Tarih yok';
  const updatedStr =
    (data.updatedAt || data.UpdatedAt) && (data.updatedAt || data.UpdatedAt) !== '0001-01-01T00:00:00'
      ? new Date(data.updatedAt || data.UpdatedAt).toLocaleString('tr-TR')
      : '';

  
  const myId = (user?.id || user?.userId)?.toString();
  const postOwnerId = (data.userId || data.UserId)?.toString();
  const isMyPost = myId && postOwnerId && myId === postOwnerId;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await client.delete(`/post/${data.id}?userId=${myId}`);
      navigate('/ana-sayfa');
    } catch (err) {
      alert('Silme işlemi başarısız!');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async () => {
    try {
      await client.put(`/post/${data.id}?userId=${myId}`, { ...data, title: editTitle, content: editContent });
      setEditing(false);
      
      const res = await client.get(`/post/${data.id}`);
      setData(res.data);
      setEditTitle(res.data.title || '');
      setEditContent(res.data.content || res.data.body || '');
    } catch (err) {
      alert('Düzenleme başarısız!');
    }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'flex-start',minHeight:'60vh',background:'#f7f9f8',padding:'32px 0'}}>
      <div className="civar-feed-card" style={{
        marginBottom: 24,
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(24,129,58,0.07)',
        padding: '28px 32px',
        background: '#fff',
        maxWidth: 800,
        minWidth: 340,
        width: '100%',
        border: '1.5px solid #eaf6ef',
        position: 'relative'
      }}>
        <button
          style={{ position: 'absolute', top: 18, right: 18, background: '#eaf6ef', color: '#18813a', border: 'none', borderRadius: 8, padding: '4px 14px', fontWeight: 500, cursor: 'pointer', fontSize: '.97rem', zIndex: 2 }}
          onClick={() => navigate(-1)}
          title="Geri dön"
        >
          ← Geri
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
          {isMyPost && !editing && (
            <div style={{marginLeft:16,display:'flex',gap:8}}>
              {deleting ? (
                <>
                  <span style={{color:'#c00',fontWeight:500,marginRight:8}}>Silinsin mi?</span>
                  <button style={{background:'#c00',color:'#fff',border:'none',borderRadius:6,padding:'2px 10px',cursor:'pointer'}} onClick={handleDelete} disabled={deleting}>Evet</button>
                  <button style={{background:'#fff',border:'1px solid #eaf6ef',color:'#888',borderRadius:6,padding:'2px 10px',cursor:'pointer'}} onClick={()=>setDeleting(false)} disabled={deleting}>Vazgeç</button>
                </>
              ) : (
                <>
                  <button style={{background:'#fff',border:'1px solid #eaf6ef',color:'#c00',borderRadius:6,padding:'2px 10px',cursor:'pointer'}} onClick={()=>setDeleting(true)}>Sil</button>
                  <button style={{background:'#fff',border:'1px solid #eaf6ef',color:'#18813a',borderRadius:6,padding:'2px 10px',cursor:'pointer'}} onClick={()=>{setEditing(true);setEditTitle(data.title);setEditContent(data.content||data.body);}}>Düzenle</button>
                </>
              )}
            </div>
          )}
        </div>
        {editing ? (
          <>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{width:'100%',marginBottom:8,padding:6,fontSize:'1.08rem',borderRadius:6,border:'1px solid #eaf6ef'}} />
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)} style={{width:'100%',minHeight:60,marginBottom:8,padding:6,fontSize:'1.07rem',borderRadius:6,border:'1px solid #eaf6ef'}} />
            <button style={{background:'#18813a',color:'#fff',border:'none',borderRadius:6,padding:'6px 18px',fontWeight:500,marginRight:8}} onClick={handleEdit}>Kaydet</button>
            <button style={{background:'#fff',border:'1px solid #eaf6ef',color:'#888',borderRadius:6,padding:'6px 18px',fontWeight:500}} onClick={()=>setEditing(false)}>İptal</button>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 600, color: '#18813a', fontSize: '1.15rem', marginBottom: 4 }}>{data.title}</div>
            <div style={{ margin: '8px 0 16px 0', whiteSpace: 'pre-line', fontSize: '1.07rem', color: '#222', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{data.content || data.body}</div>
          </>
        )}
        <div style={{ fontSize: '.97rem', color: '#666', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#888' }}>Paylaşım: {createdStr}</span>
          {updatedStr && updatedStr !== createdStr && (
            <span style={{ color: '#aaa' }}>Güncellendi: {updatedStr}</span>
          )}
        </div>
        {}
        <PostComments postId={data.id} client={client} user={user} />
      </div>
    </div>
  );



function PostComments({ postId, client, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [confirmingCommentId, setConfirmingCommentId] = useState(null);

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
    if (!newComment.trim() || !user) return;
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

  const handleDelete = async (commentId) => {
    const myId = user.id || user.userId;
    setDeletingCommentId(commentId);
    try {
      await client.delete(`/post/comments/${commentId}?userId=${myId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert('Yorum silinemedi!');
    } finally {
      setDeletingCommentId(null);
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
                <span style={{fontWeight:600, color:'#18813a', fontSize:'.97rem'}}>{c.userName || 'Kullanıcı'}</span>:
                <span style={{color:'#222', fontSize:'.97rem', marginLeft:4}}>{c.content}</span>
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


}
