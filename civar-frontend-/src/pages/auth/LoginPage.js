
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../context/ApiContext';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const { BASE_URL } = useApi();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = "E-posta veya telefon numarası gerekli";
    }
    if (!password) {
      errs.password = "Parola gerekli";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!validate()) return;

    const result = await login({ email, password });
    if (result.success) {
      window.location.href = "/ana-sayfa";
    } else {

      if (result.errors && result.errors[0] && (result.errors[0].includes('400') || result.errors[0].toLowerCase().includes('bad request'))) {
        setStatus('Geçersiz e-posta veya şifre');
      } else {
        setStatus(result.errors?.[0] || "Geçersiz e-posta veya şifre");
      }
    }
  };

  return (
    <div className="login-root-tr" style={{minHeight:'100vh',background:'#fff',display:'flex',flexDirection:'column'}}>

      <div className="login-topbar-tr">
        <div className="login-logo-tr">
          <img src={require('../../assets/civar-logo.png')} alt="Civar Logo" style={{height:48,marginRight:12}} />
          <span className="brand-text" style={{fontWeight:700,fontSize:'1.5rem',color:'#1DB954'}}>Civar</span>
        </div>
        <a href="/register" className="login-register-link-tr">Kayıt Ol</a>
      </div>

      <div className="login-form-outer-tr">
        <form className="login-form-tr" onSubmit={handleSubmit}>
          <h2>Tekrar hoş geldin</h2>
          <div className="input-group-tr">
            <input
              type="text"
              placeholder="E-posta veya telefon numarası"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? "error" : ""}
              autoFocus
            />
            {errors.email && <div className="input-error-tr">{errors.email}</div>}
          </div>
          <div className="input-group-tr" style={{position:'relative'}}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Parola"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={errors.password ? "error" : ""}
              style={{paddingRight:36}}
            />
            <span
              onClick={()=>setShowPassword(v=>!v)}
              className="eye-icon-tr"
              title={showPassword ? "Parolayı gizle" : "Parolayı göster"}
            >
              {showPassword ? <>&#128065;</> : <>&#128065;</>}
            </span>
            {errors.password && <div className="input-error-tr">{errors.password}</div>}
          </div>
            <div className="forgot-row-tr">
              <a href="/forgot-password" className="forgot-link-tr">Şifremi unuttum</a>
            </div>
          {status && <div className="input-error-tr" style={{marginBottom:8}}>{status}</div>}
          <button type="submit" className="login-btn-tr">Giriş Yap</button>
       
          <button
            type="button"
            style={{
              width: '100%',
              background: '#fff',
              color: '#444',
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: '12px 0',
              fontWeight: 600,
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              boxShadow: '0 2px 8px rgba(60,60,60,0.04)',
              cursor: 'pointer',
              marginTop: 16,
              transition: 'box-shadow 0.2s',
            }}
            onClick={() => {
              const apiBase = (BASE_URL || process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'http://localhost:5217').replace(/\/+$/, '');
              const returnUrl = (process.env.REACT_APP_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')) + '/register';
              window.location.href = `${apiBase}/account/login/google?returnUrl=${encodeURIComponent(returnUrl)}`;
            }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(60,60,60,0.10)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(60,60,60,0.04)'}
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{width:24, height:24, marginRight:8}} />
            Google ile Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
