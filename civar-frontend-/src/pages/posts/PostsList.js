
import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';

export default function PostsList({ limit }) {
  const { client } = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  
  const neighborhoodId = user?.neighborhoodId || user?.neighborhoodID || user?.mahalleId || user?.mahalleID || user?.NeighborhoodId || user?.MahalleId;
  
  useEffect(() => {
    console.log('Aktif kullanıcı (FULL):', user);
    console.log('Kullanıcının neighborhoodId:', neighborhoodId);
    console.log('User object keys:', user ? Object.keys(user) : 'user is null');
    if (!user) console.warn('user null veya yüklenmedi!');
    if (!neighborhoodId) {
      console.warn('neighborhoodId null veya undefined!');
      console.warn('Mevcut user propertyler:', user ? Object.keys(user) : 'none');
    }
  }, [user, neighborhoodId]);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', limit, neighborhoodId],
    queryFn: async () => {
      console.log('API isteği gönderiliyor, neighborhoodId:', neighborhoodId);
      
      let res;
      try {
        
        if (neighborhoodId) {
          res = await client.get('/post', {
            params: { neighborhoodId }
          });
        } else {
          
          console.warn('neighborhoodId bulunamadı, tüm postlar çekiliyor...');
          res = await client.get('/post');
        }
      } catch (err) {
        console.error('Post API hatası:', err);
        
        if (neighborhoodId) {
          console.warn('neighborhoodId ile hata alındı, tüm postları çekiliyor...');
          res = await client.get('/post');
        } else {
          throw err;
        }
      }
      
      let posts = res.data;
      console.log('API yanıtı (posts):', posts);
      
      
      if (!Array.isArray(posts)) {
        console.warn('Posts array değil:', posts);
        posts = [];
      }
      
      
      posts = posts.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.createdDate || a.dateCreated);
        const dateB = new Date(b.createdAt || b.createdDate || b.dateCreated);
        return dateB.getTime() - dateA.getTime(); 
      });
      
      if (limit) posts = posts.slice(0, limit);
      return posts;
    },
    enabled: !!client, 
    staleTime: 0, 
    cacheTime: 1000 * 60 * 5, 
  });

  const handleRefresh = () => {
    console.log('Manuel yenileme tetiklendi');
    queryClient.invalidateQueries({queryKey: ['posts']});
    refetch();
  };

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>
    <div>Error loading posts: {error.message}</div>
    <button onClick={handleRefresh} style={{marginTop: '10px', padding: '8px 16px', backgroundColor: '#179c5a', color: 'white', border: 'none', borderRadius: '4px'}}>
      Yenile
    </button>
  </div>;

  return <div>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
      <span>Posts ({data?.length || 0})</span>
      <button onClick={handleRefresh} style={{padding: '4px 8px', fontSize: '12px', backgroundColor: '#179c5a', color: 'white', border: 'none', borderRadius: '4px'}}>
        🔄 Yenile
      </button>
    </div>
    {data && data.length === 0 && (
      <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
        Henüz post yok. İlk postu sen paylaş!
      </div>
    )}
    {data && data.map(p => <div className="card" key={p.id}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>{p.title || p.subject || 'Post'}</strong>
        <span className="muted">{new Date(p.createdAt || p.createdDate || p.dateCreated).toLocaleString()}</span>
      </div>
      <div>{p.content || p.body}</div>
      {p.neighborhood && <div className="muted">Neighborhood: {p.neighborhood.name}</div>}
    </div>)}
  </div>;
}
