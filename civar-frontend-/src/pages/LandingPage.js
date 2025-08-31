import React, { useState } from 'react';
import './LandingPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../context/ApiContext';
import civarLogo from '../assets/civar-logo.png';
import mahalleBg from '../assets/mahalle-bg.png';



export default function LandingPage(){
  const navigate = useNavigate();
  const { login } = useAuth();
  const { BASE_URL } = useApi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const validate = () => {
    const errs = {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      errs.email = "Lütfen geçerli bir e-posta adresi girin";
    }
    if (!password || password.length < 6) {
      errs.password = "Şifre en az 6 karakter olmalı";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!validate()) return;
    try {
    
      const result = await login({ email, password });
      if (result?.success) {
     
        navigate('/ana-sayfa', { replace: true });
        return;
      }

      navigate(`/register?email=${encodeURIComponent(email)}`);
    } catch (err) {
    
      navigate(`/register?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="civar-landing-root">
      <header className="civar-header">
        <div className="max header-inner">
          <div className="brand" aria-label="Civar Ana Sayfa">
            <img src={civarLogo} alt="Civar Logo" className="brand-icon-img" style={{height: 40, marginRight: 8}} />
            <span className="brand-text">Civar</span>
          </div>

          <div style={{flex: 1}}></div>
          <div className="auth-cta">
            <Link to="/login" className="btn small ghost">Giriş</Link>
            <Link to="/register" className="btn small primary">Kaydol</Link>
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div className="max hero-wrap">
          <div className="hero-media">
            <img src={mahalleBg} alt="Mahalle sokak görüntüsü" />
            <div className="signup-card" role="form" aria-labelledby="signup-title">
              <h1 id="signup-title">Mahalleni Keşfet</h1>
              <form onSubmit={handleQuickRegister} className="quick-form" aria-label="Hızlı kayıt" noValidate>
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="E-posta adresi"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={errors.email ? "error" : ""}
                  />
                  {errors.email && (
                    <div className="input-error"><span>❗</span> {errors.email}</div>
                  )}
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    placeholder="Şifre oluştur"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={errors.password ? "error" : ""}
                  />
                  {errors.password && (
                    <div className="input-error"><span>❗</span> {errors.password}</div>
                  )}
                </div>
                <button type="submit" className="btn full continue">Devam Et</button>
              </form>
              
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
                  marginTop: 12,
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
              <p className="already">Hesabın var mı? <Link to="/login">Giriş yap</Link></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
