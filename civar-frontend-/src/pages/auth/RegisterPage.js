
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';


function GoogleAuthRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    
    if (token && email) {
      localStorage.removeItem('token');
      return;
    }

    if (token && !email) {
      localStorage.setItem('token', token);
      navigate('/ana-sayfa', { replace: true });
    }
  }, [location, navigate]);
  return null;
}

export default function RegisterPage() {

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const { client, BASE_URL } = useApi();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    cityName: "",
    districtName: "",
    neighborhoodId: "",
    newNeighborhoodName: "",
    address: "",
    phoneNumber: "",
    gender: "",
    birthDate: "",
  });
  const isGoogleUser = !!params.get('email');
  const emailFromParams = params.get('email');
      useEffect(() => {
        const fullName = params.get('fullName');
        let name = "";
        let surname = "";
        if (fullName) {
          const parts = fullName.trim().split(" ");
          name = parts[0] || "";
          surname = parts.slice(1).join(" ") || "";
        }
        setForm((prev) => ({
          ...prev,
          email: emailFromParams || prev.email,
          name: name || prev.name,
          surname: surname || prev.surname,
        }));
      }, [location.search]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [neighborhoodSuggestions, setNeighborhoodSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const neighborhoodInputRef = useRef();



  useEffect(() => {
    async function fetchCities() {
      try {
  const res = await client.get('/location/cities');
        setCities(res.data);
      } catch {}
    }
    fetchCities();
  }, [client]);


  useEffect(() => {
    if (!form.cityName) {
      setDistricts([]);
      setForm(f => ({ ...f, districtName: "" }));
      return;
    }
    async function fetchDistricts() {
      try {
        const res = await client.get(`/location/districts?city=${encodeURIComponent(form.cityName)}`);
        setDistricts(res.data);
      } catch {
        setDistricts([]);
      }
    }
    fetchDistricts();
  }, [client, form.cityName]);

  useEffect(() => {
    if (!form.cityName || !form.districtName) {
      setNeighborhoods([]);
      return;
    }
    async function fetchNeighborhoods() {
      try {
        const res = await client.get(`/location/neighborhoods?city=${encodeURIComponent(form.cityName)}&district=${encodeURIComponent(form.districtName)}`);
        console.log('Mahalle API response:', res.data);
        setNeighborhoods(res.data);
      } catch (err) {
        setNeighborhoods([]);
        console.log('Mahalle API error:', err);
      }
    }
    fetchNeighborhoods();
  }, [client, form.cityName, form.districtName]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [apiErrors, setApiErrors] = useState([]);
  const [verificationSent, setVerificationSent] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [lockedEmail, setLockedEmail] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "cityName") {
      setForm(f => ({ ...f, districtName: "", newNeighborhoodName: "" }));
    }
    if (e.target.name === "districtName") {
      setForm(f => ({ ...f, newNeighborhoodName: "" }));
    }
  };


  const handleNeighborhoodInput = (e) => {
    const value = e.target.value;
    setForm(f => ({ ...f, newNeighborhoodName: value, neighborhoodId: "" }));
  console.log('Neighborhoods state:', neighborhoods);
  if (value.length > 0 && neighborhoods.length > 0) {
      let suggestions = neighborhoods.filter(n => {
        const label = n.name || n.Neighbourhood;
        return label && label.toLowerCase().includes(value.toLowerCase());
      });

      const exactMatch = suggestions.find(n => {
        const label = n.name || n.Neighbourhood;
        return label && label.toLowerCase() === value.toLowerCase();
      });
      if (exactMatch) {
        suggestions = [exactMatch, ...suggestions.filter(n => n !== exactMatch)];
      }
      setNeighborhoodSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setNeighborhoodSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleNeighborhoodSelect = (n) => {
  setForm(f => ({ ...f, newNeighborhoodName: n.name || n.Neighbourhood, neighborhoodId: n.id || n.Id }));
    setShowSuggestions(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = "Ad gerekli";
    if (!form.surname) errs.surname = "Soyad gerekli";
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      errs.email = "Lütfen geçerli bir e-posta adresi girin";
    }
    if (!form.password || form.password.length < 6) {
      errs.password = "Şifre en az 6 karakter olmalı";
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Şifreler eşleşmiyor";
    }
    if (!form.phoneNumber) errs.phoneNumber = "Telefon numarası gerekli";
    if (!form.neighborhoodId && !form.newNeighborhoodName) {
      errs.neighborhoodId = "Mahalle seçilmeli veya yeni mahalle adı girilmeli";
    }
    if (!form.neighborhoodId && form.newNeighborhoodName) {
      if (!form.cityName) errs.cityName = "İl gerekli";
      if (!form.districtName) errs.districtName = "İlçe gerekli";
    }
    if (!form.address) errs.address = "Adres gerekli";
    setErrors(errs);
    return { ok: Object.keys(errs).length === 0, errs };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setApiErrors([]);
    console.info('RegisterPage.handleSubmit start', { form });
    const { ok, errs } = validate();
    if (!ok) {
      console.warn('RegisterPage - validation failed', errs);
      setStatus('Form doğrulaması başarısız. Lütfen gerekli alanları doldurun.');
      return;
    }
  try {
      let newNeighborhoodName = form.newNeighborhoodName;
      let neighborhoodId = form.neighborhoodId;

      const match = neighborhoods.find(n => n.neighbourhood.toLowerCase() === (form.newNeighborhoodName || '').toLowerCase());
      if (match) {
        neighborhoodId = match.id;
        newNeighborhoodName = match.neighbourhood;
      } else if (!form.neighborhoodId && form.newNeighborhoodName) {

        if (!/\.MAH$/i.test(newNeighborhoodName)) {
          newNeighborhoodName = newNeighborhoodName.replace(/\s+$/, '') + '.MAH';
        }
      }
      const submitForm = {
        name: form.name,
        surname: form.surname,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        phoneNumber: form.phoneNumber,
        address: form.address,
        cityName: form.cityName,
        districtName: form.districtName,
        neighborhoodId: neighborhoodId ? neighborhoodId : undefined,
        newNeighborhoodName: !neighborhoodId && newNeighborhoodName ? newNeighborhoodName : undefined,
        ...(isGoogleUser ? { IsGoogleUser: true } : {})
      };
      if (isGoogleUser) {

        const regResult = await register(submitForm);
        if (!regResult?.success) {
          console.error('Register error:', regResult);
          setStatus(regResult?.errors?.[0] || "Kayıt başarısız");
          setApiErrors(regResult?.errors || []);
          return;
        }
        const loginResult = await login({ email: form.email, password: form.password });
        if (!loginResult?.success) {
          console.error('Login error:', loginResult);
          setStatus(loginResult?.errors?.[0] || "Giriş başarısız");
          setApiErrors(loginResult?.errors || []);
          return;
        }
        window.location.replace('/ana-sayfa');
        return;
      }
  
      if (!verificationSent) {
        await sendVerification();
        setStatus('Doğrulama kodu gönderildi. Lütfen gelen kodu girip ardından tekrar Kayıt Ol butonuna basın.');
        return;
      }
   
      if (!verificationCode) {
        setStatus('Lütfen e-posta ile gönderilen doğrulama kodunu girin.');
        return;
      }

  submitForm.email = String(submitForm.email || form.email || '').trim().toLowerCase();
  submitForm.VerificationCode = String(verificationCode || '').trim();
  console.info('Register attempt time:', new Date().toISOString(), 'email:', submitForm.email, 'code:', submitForm.VerificationCode);
      console.info('Attempting register with payload:', submitForm);
      const regResult = await register(submitForm);
      console.info('Register result:', regResult);
      if (!regResult?.success) {
        console.error('Register error:', regResult);
        setStatus(regResult?.errors?.[0] || "Kayıt başarısız");
        setApiErrors(regResult?.errors || []);
        return;
      }

      console.info('Attempting login after register');
      const loginResult = await login({ email: form.email, password: form.password });
      console.info('Login result:', loginResult);
      if (!loginResult?.success) {
        console.error('Login error:', loginResult);
        setStatus(loginResult?.errors?.[0] || "Giriş başarısız");
        setApiErrors(loginResult?.errors || []);
        return;
      }
      window.location.replace('/ana-sayfa');
    } catch (e) {
      console.error('Register exception:', e, e?.response?.data);
      const apiErrs = e.response?.data?.errors;
      if (Array.isArray(apiErrs) && apiErrs.length > 0) {
        setApiErrors(apiErrs);
      } else {
        setStatus(e.response?.data?.message || e.message || "Kayıt başarısız");
      }
    }
  };

  const sendVerification = async () => {
    const params = new URLSearchParams(location.search);
    const isGoogleUser = !!params.get('email');
    if (isGoogleUser) return; 
    if (sendingVerification || verificationSent) return;
    try {
      setSendingVerification(true);
      setStatus('');
    
      const raw = (BASE_URL || process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'https://civarapi-efe8gfcjd0bqd8fu.westeurope-01.azurewebsites.net');
      let normalizedBase = String(raw).replace(/\/+$/, '');
      if (!normalizedBase.toLowerCase().endsWith('/api')) normalizedBase = normalizedBase + '/api';
      const targetUrl = `${normalizedBase}/auth/send-verification-code`;
      console.info('Sending verification to URL:', targetUrl);

      
      const sendEmail = String(form.email || '').trim().toLowerCase();
      console.info('sendVerification - sending at', new Date().toISOString(), 'for email:', sendEmail);
    
      await client.post(targetUrl, {
        email: sendEmail,
        isGoogleUser: isGoogleUser
      });
     
      setForm(f => ({ ...f, email: sendEmail }));
      setLockedEmail(true);
      setVerificationSent(true);
      setStatus('Doğrulama kodu gönderildi. Gelen kutunuzu kontrol edin.');
    } catch (err) {
      console.error('sendVerification failed:', err, err?.response?.data);
      setStatus(err?.response?.data?.Message || err?.response?.data?.message || 'Kod gönderilemedi');
    } finally {
      setSendingVerification(false);
    }
  };



  return (
    <>
      <GoogleAuthRedirectHandler />
      <div className="login-root-tr" style={{minHeight:'100vh',background:'#fff',display:'flex',flexDirection:'column'}}>
      {/* Üst bar */}
      <div className="login-topbar-tr">
        <div className="login-logo-tr">
          <img src={require('../../assets/civar-logo.png')} alt="Civar Logo" style={{height:48,marginRight:12}} />
          <span className="brand-text" style={{fontWeight:700,fontSize:'1.5rem',color:'#1DB954'}}>Civar</span>
        </div>
        <a href="/login" className="login-register-link-tr">Giriş Yap</a>
      </div>
      {/* Form alanı */}
      <div className="login-form-outer-tr">
        <form className="login-form-tr" onSubmit={handleSubmit}>
          <h2>Hesap Oluştur</h2>
          <div className="input-group-tr">
            <input
              type="text"
              name="name"
              placeholder="Ad"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              autoFocus
            />
            {errors.name && <div className="input-error-tr">{errors.name}</div>}
          </div>
          <div className="input-group-tr">
            <input
              type="text"
              name="surname"
              placeholder="Soyad"
              value={form.surname}
              onChange={handleChange}
              className={errors.surname ? "error" : ""}
            />
            {errors.surname && <div className="input-error-tr">{errors.surname}</div>}
          </div>
          <div className="input-group-tr">
            <input
              type="email"
              name="email"
              placeholder="E-posta adresi"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              readOnly={isGoogleUser}
              style={isGoogleUser ? { background: '#f5f5f5', color: '#888', filter: 'blur(0.5px)', opacity: 0.7, cursor: 'not-allowed' } : {}}
            />
            {errors.email && <div className="input-error-tr">{errors.email}</div>}
            {!isGoogleUser && (
              <div style={{marginTop:8,display:'flex',gap:8,alignItems:'center'}}>
                  <button type="button" onClick={sendVerification} disabled={!form.email || verificationSent || sendingVerification} style={{height:36,backgroundColor:'#1DB954',color:'#fff',border:'none',padding:'8px 12px',borderRadius:8}}>{sendingVerification ? 'G\u00f6nderiliyor...' : (verificationSent ? 'Kod Gönderildi' : 'Kod G\u00f6nder')}</button>
                {verificationSent && (
                    <>
                      <input placeholder="Kod" value={verificationCode} onChange={e=>setVerificationCode(e.target.value)} style={{height:36,padding:8,borderRadius:6,border:'1px solid #e0e0e0'}} />
                    </>
                )}
              </div>
            )}
          </div>
          <div className="input-group-tr" style={{position:'relative'}}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Parola"
              value={form.password}
              onChange={handleChange}
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
          <div className="input-group-tr" style={{position:'relative'}}>
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Parola (Tekrar)"
              value={form.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "error" : ""}
              style={{paddingRight:36}}
            />
            <span
              onClick={()=>setShowConfirm(v=>!v)}
              className="eye-icon-tr"
              title={showConfirm ? "Parolayı gizle" : "Parolayı göster"}
            >
              {showConfirm ? <>&#128065;</> : <>&#128065;</>}
            </span>
            {errors.confirmPassword && <div className="input-error-tr">{errors.confirmPassword}</div>}
          </div>
          <div className="input-group-tr">
            <input
              type="text"
              name="phoneNumber"
              placeholder="Telefon Numarası"
              value={form.phoneNumber}
              onChange={handleChange}
              className={errors.phoneNumber ? "error" : ""}
            />
            {errors.phoneNumber && <div className="input-error-tr">{errors.phoneNumber}</div>}
          </div>

          <div className="input-group-tr">
            <select
              name="cityName"
              value={form.cityName}
              onChange={handleChange}
              className={errors.cityName ? "error" : ""}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 10,
                border: '1.5px solid #b0bec5',
                fontSize: 17,
                padding: '0 16px',
                background: '#f8f9fa',
                color: '#222',
                fontFamily: 'Segoe UI, Arial, sans-serif',
                marginBottom: 0,
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'none',
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: 0.1
              }}
            >
              <option value="">İl Seçiniz</option>
              {cities.map((c, i) => (
                <option key={c.id || c.cityName || c.name || i} value={c.name || c.cityName || c}>{c.name || c.cityName || c}</option>
              ))}
            </select>
            {errors.cityName && <div className="input-error-tr">{errors.cityName}</div>}
          </div>
     
          <div className="input-group-tr">
            <select
              name="districtName"
              value={form.districtName}
              onChange={handleChange}
              className={errors.districtName ? "error" : ""}
              disabled={!form.cityName}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 10,
                border: '1.5px solid #b0bec5',
                fontSize: 17,
                padding: '0 16px',
                background: '#f8f9fa',
                color: '#222',
                fontFamily: 'Segoe UI, Arial, sans-serif',
                marginBottom: 0,
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'none',
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: 0.1
              }}
            >
              <option value="">İlçe Seçiniz</option>
              {districts.map((d, i) => (
                <option key={d + i} value={d}>{d}</option>
              ))}
            </select>
            {errors.districtName && <div className="input-error-tr">{errors.districtName}</div>}
          </div>
    
          <div className="input-group-tr">
            <select
              name="neighborhoodId"
              value={form.neighborhoodId}
              onChange={handleChange}
              className={errors.neighborhoodId ? "error" : ""}
              disabled={!form.cityName || !form.districtName}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 10,
                border: '1.5px solid #b0bec5',
                fontSize: 17,
                padding: '0 16px',
                background: '#f8f9fa',
                color: '#222',
                fontFamily: 'Segoe UI, Arial, sans-serif',
                marginBottom: 0,
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: 'none',
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: 0.1
              }}
            >
              <option value="">Mahalle Seçiniz</option>
              {neighborhoods.map((n, i) => (
                <option key={n.id || i} value={n.id}>{n.neighbourhood}</option>
              ))}
            </select>
            {errors.neighborhoodId && <div className="input-error-tr">{errors.neighborhoodId}</div>}
          </div>
  
          <div className="input-group-tr">
            <input
              type="text"
              name="address"
              placeholder="Adres"
              value={form.address}
              onChange={handleChange}
              className={errors.address ? "error" : ""}
            />
            {errors.address && <div className="input-error-tr">{errors.address}</div>}
          </div>
          {!isGoogleUser && status && <div className="input-error-tr" style={{marginBottom:8}}>{status}</div>}
          {apiErrors.length > 0 && (
            <div className="input-error-tr" style={{marginBottom:8}}>
              {apiErrors.map((err, i) => (
                <div key={i}>❗ {err}</div>
              ))}
            </div>
          )}
          <button type="submit" className="login-btn-tr" style={{backgroundColor:'#1DB954',color:'#fff',border:'none',height:48,borderRadius:999,fontWeight:700}}>Kayıt Ol</button>
        </form>
      </div>
    </div>
    </>
  );
}

