import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const { client } = useApi();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const [sentAt, setSentAt] = useState(null);
  const [resendDisabledUntil, setResendDisabledUntil] = useState(0);

  const handleSend = async (e) => {
    e.preventDefault();
    setStatus('');
    const cleanEmail = (email || '').trim();
    if (!cleanEmail) { setStatus('Lütfen e-posta girin'); return; }
    try {
      setLoading(true);
      
      const res = await client.post('/auth/forgot-password', JSON.stringify(cleanEmail), { headers: { 'Content-Type': 'application/json' } });
      setStatus(res.data?.Message || 'Kod gönderildi');
      setVerificationSent(true);
      const now = Date.now();
      setSentAt(now);
      setResendDisabledUntil(now + 60 * 1000); 
    } catch (err) {
      setStatus(err?.response?.data?.Message || err.message || 'Gönderme hatası');
    } finally { setLoading(false); }
  };

  
  
  
  const handleVerifyAndGo = () => {
    const cleanEmail = (email || '').trim();
    const cleanCode = (code || '').trim();
    if (!cleanEmail || !cleanCode) { setStatus('E-posta ve kod gerekli'); return; }
    
    navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}&code=${encodeURIComponent(cleanCode)}`);
  };

  
  const remainingMillis = sentAt ? Math.max(0, (sentAt + 5 * 60 * 1000) - Date.now()) : 0;
  const resendRemaining = Math.max(0, resendDisabledUntil - Date.now());

  return (
    <div style={{padding:24, display:'flex', justifyContent:'center', alignItems:'center', minHeight: '100vh', background:'#fbfbfb'}}>
      <div style={{width:'100%',maxWidth:520,background:'#fff',padding:28,borderRadius:12,boxShadow:'0 12px 40px rgba(15,23,42,0.06)'}}>
        <h2 style={{marginTop:0,marginBottom:8,color:'#222'}}>Şifre Sıfırlama</h2>
        <p style={{marginTop:0,color:'#444'}}>E-posta adresinizi girin; size 5 dakikalık bir kod göndereceğiz. Gelen kodu aşağıya girip şifrenizi sıfırlayabilirsiniz.</p>
        <form onSubmit={handleSend} style={{maxWidth:420,marginTop:12}}>
          <div style={{marginBottom:12}}>
            <input type="email" placeholder="E-posta adresi" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',height:44,padding:10,borderRadius:8,border:'1px solid #e0e0e0'}} />
          </div>
          {status && <div style={{marginBottom:12,color: status.toLowerCase().includes('kod gönderildi') ? '#2e7d32' : '#b00020'}}>{status}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:12,alignItems:'center'}}>
            <button disabled={loading} className="login-btn-tr" style={{flex:1,backgroundColor:'#1DB954',border:'none',color:'#fff',height:48,borderRadius:999,fontWeight:700}}>Kodu Gönder</button>
            <a href="/login" style={{display:'inline-block',textDecoration:'none',backgroundColor:'#1DB954',color:'#fff',padding:'10px 18px',borderRadius:8}}>Girişe dön</a>
          </div>
        </form>

        {verificationSent && (
          <div style={{maxWidth:420, marginTop:20}}>
            <div style={{marginBottom:8}}>
              <input placeholder="E-posta ile gelen kod" value={code} onChange={e=>setCode(e.target.value)} style={{width:'100%',height:44,padding:10,borderRadius:8,border:'1px solid #e0e0e0'}} />
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12,alignItems:'center'}}>
              <button onClick={handleVerifyAndGo} className="login-btn-tr" style={{flex:1,backgroundColor:'#1DB954',border:'none',color:'#fff',height:48,borderRadius:999,fontWeight:700}}>Kodu Doğrula</button>
              <a href={`/reset-password?email=${encodeURIComponent(email)}`} style={{display:'inline-block',textDecoration:'none',backgroundColor:'#1DB954',color:'#fff',padding:'10px 18px',borderRadius:8}}>Elimde kod var</a>
            </div>
            <div style={{marginTop:12,color:'#555'}}>
              {remainingMillis > 0 ? (
                <div>Kodun geçerlilik süresi: {Math.ceil(remainingMillis / 1000)} saniye</div>
              ) : (
                <div style={{color:'#b00020'}}>Kodun süresi dolmuş olabilir. Lütfen tekrar gönderin.</div>
              )}
              <div style={{marginTop:8}}>
                <button disabled={resendRemaining > 0} onClick={handleSend} style={{height:40,backgroundColor: resendRemaining>0 ? '#a5d6a7' : '#1DB954', border:'none', color:'#fff', padding:'8px 12px', borderRadius:8}}>
                  {resendRemaining > 0 ? `Tekrar gönder (${Math.ceil(resendRemaining/1000)}s)` : 'Tekrar Gönder'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
