
import React, { useEffect, useState } from "react";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";
import "./AccountSettingsPage.css";

export default function AccountSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { client } = useApi();
  
  
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    bio: "",
    address: "",
    phone: "",
    neighborhoodId: ""
  });
  const [neighborhood, setNeighborhood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const userId = user?.id || user?._id;
    if (!userId || !client) return;
    setLoading(true);
    setError("");
    client.get(`/user/${userId}`)
      .then(userRes => {
        if (!isMounted) return;
        const data = userRes.data;
        setForm({
          name: data.name || data.Name || "",
          surname: data.surname || data.Surname || "",
          email: data.email || data.Email || "",
          bio: data.bio || data.Bio || "",
          address: data.address || data.Address || "",
          phone: data.phone || data.Phone || data.phoneNumber || data.PhoneNumber || "",
          neighborhoodId: data.neighborhoodId || data.mahalleId || data.NeighborhoodId || data.MahalleId || ""
        });
        const nId = data.neighborhoodId || data.mahalleId || data.NeighborhoodId || data.MahalleId;
        if (nId) {
          client.get(`/neighborhood/${nId}`)
            .then(nRes => {
              if (!isMounted) return;
              setNeighborhood(nRes.data);
              setLoading(false);
            })
            .catch(() => {
              if (!isMounted) return;
              setNeighborhood(null);
              setLoading(false);
            });
        } else {
          setNeighborhood(null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Kullanıcı bilgisi alınamadı.");
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [user?.id]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const userId = user?.id || user?._id;
    if (!userId) return;
    
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      
      await client.put(`/user/${userId}`, {
        ...form,
        phoneNumber: form.phone,
        neighborhoodId: form.neighborhoodId
      });
      setSuccess(true);
    } catch (err) {
      setError("Güncelleme başarısız oldu.");
    }
    setSaving(false);
  };

  const handleAvatarChange = e => {
    setAvatarFile(e.target.files[0]);
  };

  const handleAvatarUpload = async e => {
    e.preventDefault();
    if (!avatarFile) return;
    setAvatarLoading(true);
    setAvatarSuccess("");
    setAvatarError("");
    const formData = new FormData();
    formData.append("ProfilePictureFile", avatarFile); 
    try {
      const res = await client.put(`/user/${user.id}/profile-picture`, formData);
      if (res.status === 204) {
        setAvatarSuccess("Profil resmi başarıyla yüklendi!");
        setAvatarFile(null);
        if (typeof refreshUser === 'function') await refreshUser();
      } else {
        setAvatarError("Profil resmi yüklenemedi.");
      }
    } catch (e) {
      setAvatarError("Profil resmi yüklenemedi.");
    }
    setAvatarLoading(false);
  };

  const handlePwChange = e => {
    setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePwSubmit = async e => {
    e.preventDefault();
    setPwLoading(true);
    setPwSuccess("");
    setPwError("");
    try {
      const res = await client.put(`/User/${user.id}/password`, pwForm);
      if (res.status === 204) {
        setPwSuccess("Şifre başarıyla güncellendi!");
        setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      } else {
        setPwError("Şifre güncellenemedi.");
      }
    } catch (err) {
      if (err.response && err.response.data && (err.response.data.message || typeof err.response.data === 'string')) {
        setPwError(err.response.data.message || err.response.data);
      } else {
        setPwError("Şifre güncellenemedi.");
      }
    }
    setPwLoading(false);
  };
  

  

  
  
  return (
    <div className="account-settings-container" style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '20px auto',
      padding: '20px',
      background: '#f5f8f7',
      borderRadius: '16px',
      minHeight: '90vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto 1fr',
      gap: '24px'
    }}>
      <h2 style={{
        gridColumn: '1 / -1',
        color: '#179c5a',
        fontSize: '2.5rem',
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: '10px',
        letterSpacing: '1px',
        textShadow: '0 2px 4px rgba(23,156,90,0.2)',
        background: 'linear-gradient(135deg, #179c5a 0%, #13b77a 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>⚙️ Hesap Ayarları</h2>
      {}
      <div className="settings-card" style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(24,129,58,0.12)',
        padding: '24px',
        border: '1px solid #e8f5ee',
        overflowY: 'auto',
        maxHeight: '80vh'
      }}>
        {loading ? (
          <div style={{textAlign:'center', color:'#179c5a', fontWeight:'600', fontSize:'16px'}}>Yükleniyor...</div>
        ) : error ? (
          <div style={{textAlign:'center', color:'#e53e3e', fontWeight:'600', fontSize:'16px'}}>{error}</div>
        ) : (
          <>
            <form className="account-form" onSubmit={handleSubmit}>
              {}
              <div style={{
                background: '#f8fffe',
                border: '1px dashed #179c5a',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <h4 style={{
                  color: '#179c5a',
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: '0 0 8px 0',
                  textAlign: 'center'
                }}>Profil Resmi</h4>
                {user?.profilePictureUrl && (
                  <img
                    src={user.profilePictureUrl}
                    alt="Profil"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: 8,
                      border: '2px solid #179c5a',
                    }}
                  />
                )}
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div style={{
                  marginBottom: '25px', 
                  padding: '15px', 
                  background: 'linear-gradient(145deg, #f0fff4 0%, #e6fffa 100%)', 
                  borderRadius: '15px',
                  border: '2px solid #179c5a'
                }}>
                  <label style={{
                    fontWeight: '800', 
                    color: '#179c5a', 
                    fontSize: '18px', 
                    marginBottom: '15px',
                    display: 'block',
                    textAlign: 'center'
                  }}>
                    📝 Biyografi
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={8}
                    placeholder="Kendinizi kısaca tanıtın, ilgi alanlarınızı ve hobilerinizi paylaşın..."
                    style={{
                      border: '3px solid #179c5a',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      fontSize: '16px',
                      background: '#ffffff',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '150px',
                      maxHeight: '300px',
                      width: '100%',
                      boxSizing: 'border-box',
                      lineHeight: '1.6',
                      color: '#2d3748',
                      fontWeight: '500',
                      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                      boxShadow: '0 6px 20px rgba(23, 156, 90, 0.2)'
                    }}
                  ></textarea>
                </div>
              <button type="submit" disabled={saving} style={{
                background: saving ? '#95a5a6' : 'linear-gradient(135deg, #179c5a 0%, #13b77a 50%, #0e8c4f 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer',
                width: '100%',
                boxShadow: saving ? 'none' : '0 8px 25px rgba(23,156,90,0.3)',
                transform: saving ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                {saving ? "💾 Kaydediliyor..." : "✅ Değişiklikleri Kaydet"}
              </button>
              {success && <div style={{
                color: '#179c5a', 
                fontWeight: '700', 
                marginTop: '12px', 
                fontSize: '15px',
                textAlign: 'center',
                padding: '12px',
                background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                borderRadius: '10px',
                border: '2px solid #179c5a',
                boxShadow: '0 4px 15px rgba(23,156,90,0.2)'
              }}>✅ Başarıyla güncellendi!</div>}
              {error && <div style={{
                color: '#e53e3e', 
                fontWeight: '700', 
                marginTop: '12px', 
                fontSize: '15px',
                textAlign: 'center',
                padding: '12px',
                background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                borderRadius: '10px',
                border: '2px solid #e53e3e',
                boxShadow: '0 4px 15px rgba(229,62,62,0.2)'
              }}>❌ {error}</div>}
              {}
            </div>
            </form>
            <div style={{marginTop: '12px'}}>
              <label style={{fontWeight: '600', color: '#2d3748', fontSize: '13px', marginBottom: '6px', display: 'block'}}>Mahalle</label>
              <input
                value={neighborhood ? (neighborhood.neighbourhood || neighborhood.name) : ''}
                disabled
                style={{border: '2px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', background: '#f7fafc', outline: 'none', color: '#888', width: '100%'}}
              />
            </div>
          </>
        )}
      </div>
      {}
      <div className="settings-card" style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(24,129,58,0.12)',
        padding: '24px',
        border: '1px solid #e8f5ee'
      }}>
        <form className="account-form" onSubmit={handlePwSubmit}>
          <h3 style={{
            color: '#179c5a',
            fontSize: '1.1rem',
            fontWeight: '700',
            margin: '0 0 16px 0',
            paddingBottom: '8px',
            borderBottom: '2px solid #e8f5ee'
          }}>Şifre Güncelle</h3>
          <label style={{fontWeight: '600', color: '#2d3748', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginBottom: '12px'}}>
            Mevcut Şifre
            <input name="currentPassword" type="password" value={pwForm.currentPassword} onChange={handlePwChange} required style={{border: '2px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', background: '#f7fafc', outline: 'none'}} />
          </label>
          <label style={{fontWeight: '600', color: '#2d3748', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginBottom: '12px'}}>
            Yeni Şifre
            <input name="newPassword" type="password" value={pwForm.newPassword} onChange={handlePwChange} required style={{border: '2px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', background: '#f7fafc', outline: 'none'}} />
          </label>
          <label style={{fontWeight: '600', color: '#2d3748', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginBottom: '16px'}}>
            Yeni Şifre (Tekrar)
            <input name="confirmNewPassword" type="password" value={pwForm.confirmNewPassword} onChange={handlePwChange} required style={{border: '2px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '14px', background: '#f7fafc', outline: 'none'}} />
          </label>
          <button type="submit" disabled={pwLoading} style={{
            background: pwLoading ? '#95a5a6' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 50%, #a93226 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: pwLoading ? 'not-allowed' : 'pointer',
            width: '100%',
            boxShadow: pwLoading ? 'none' : '0 8px 25px rgba(231,76,60,0.3)',
            transform: pwLoading ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.3s ease',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
          >{pwLoading ? "🔄 Güncelleniyor..." : "🔐 Şifreyi Güncelle"}</button>
          {pwSuccess && <div style={{
            color: '#179c5a', 
            fontWeight: '700', 
            marginTop: '12px', 
            fontSize: '15px',
            textAlign: 'center',
            padding: '12px',
            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
            borderRadius: '10px',
            border: '2px solid #179c5a',
            boxShadow: '0 4px 15px rgba(23,156,90,0.2)'
          }}>✅ {pwSuccess}</div>}
          {pwError && <div style={{
            color: '#e53e3e', 
            fontWeight: '700', 
            marginTop: '12px', 
            fontSize: '15px',
            textAlign: 'center',
            padding: '12px',
            background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
            borderRadius: '10px',
            border: '2px solid #e53e3e',
            boxShadow: '0 4px 15px rgba(229,62,62,0.2)'
          }}>❌ {pwError}</div>}
        </form>
      </div>
    </div>
  );

}
