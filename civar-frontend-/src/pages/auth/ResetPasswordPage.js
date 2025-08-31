import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import { useLocation } from 'react-router-dom';

export default function ResetPasswordPage() {
  const { client } = useApi();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const e = params.get('email');
      if (e) setEmail(e);
  const c = params.get('code');
  if (c) setCode(c);
    } catch (e) {}
  }, [location.search]);

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!email || !code || !newPassword || !newPasswordConfirm) { setStatus('Tüm alanları doldurun'); return; }
    if (newPassword !== newPasswordConfirm) { setStatus('Yeni şifreler uyuşmuyor'); return; }
    try {
      setLoading(true);
      const payload = { Email: email, Code: code, NewPassword: newPassword };
      const res = await client.post('/auth/reset-password', payload);
      setStatus(res.data?.message || 'Şifre başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz.');
      
      setTimeout(() => window.location.replace('/login'), 1200);
    } catch (err) {
      setStatus(err?.response?.data?.message || err.message || 'Hata');
    } finally { setLoading(false); }
  };

  return (
    <div style={{padding:24, display:'flex', justifyContent:'center', alignItems:'center', minHeight: '100vh', background:'#fbfbfb'}}>
      <div style={{width:'100%',maxWidth:520,background:'#fff',padding:28,borderRadius:12,boxShadow:'0 12px 40px rgba(15,23,42,0.06)'}}>
        <h2 style={{marginTop:0, marginBottom:8}}>Yeni Şifre Belirle</h2>
        <p style={{color:'#444',marginTop:0}}>E-posta ve kod otomatik dolmadıysa elle girin. Yeni şifreyi iki kez girin.</p>
        <form onSubmit={handleReset} style={{maxWidth:420,marginTop:12}}>
          <div style={{marginBottom:8}}>
            <input type="email" placeholder="E-posta" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',height:44,padding:10,borderRadius:8,border:'1px solid #e0e0e0'}} />
          </div>
          <div style={{marginBottom:8}}>
            <input type="text" placeholder="Kod" value={code} onChange={e=>setCode(e.target.value)} style={{width:'100%',height:44,padding:10,borderRadius:8,border:'1px solid #e0e0e0'}} />
          </div>
          <div style={{marginBottom:8}}>
            <input type="password" placeholder="Yeni Parola" value={newPassword} onChange={e=>setNewPassword(e.target.value)} style={{width:'100%',height:44,padding:10,borderRadius:8,border:'1px solid #e0e0e0'}} />
          </div>
          <div style={{marginBottom:8}}>
            <input type="password" placeholder="Yeni Parola (Tekrar)" value={newPasswordConfirm} onChange={e=>setNewPasswordConfirm(e.target.value)} style={{width:'100%',height:44,padding:10,borderRadius:8,border:'1px solid #e0e0e0'}} />
          </div>
          {status && <div style={{marginBottom:12,color:'#b00020'}}>{status}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:12,alignItems:'center'}}>
            <button disabled={loading} className="login-btn-tr" style={{flex:1,backgroundColor:'#1DB954',border:'none',color:'#fff',height:48,borderRadius:999,fontWeight:700}}>Şifreyi Sıfırla</button>
            <a href="/login" style={{display:'inline-block',textDecoration:'none',backgroundColor:'#1DB954',color:'#fff',padding:'10px 18px',borderRadius:8}}>Girişe dön</a>
          </div>
        </form>
      </div>
    </div>
  );
}
