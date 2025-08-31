import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './CivarPostShareBox.css';

export default function CivarPostShareBox({ onShare }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [kategori, setKategori] = useState(0);
  const mahalleId = user?.neighborhoodId || user?.neighborhoodID || user?.mahalleId || user?.mahalleID || user?.NeighborhoodId || user?.MahalleId || user?.neighborhood?.id || user?.mahalle?.id;
  const mahalleName = user?.neighborhoodName || user?.neighborhood?.name || user?.mahalle?.name || user?.neighborhood?.title || user?.mahalle?.title || '';

  
  
  const kategoriler = [
    { value: 0, label: 'Genel' },
    { value: 1, label: 'Duyuru' },
    { value: 2, label: 'Hizmet Talebi' },
    { value: 3, label: 'Kayıp Eşya' },
    { value: 4, label: 'Etkinlik' },
    { value: 5, label: 'Satılık' },
    { value: 6, label: 'Tavsiye' },
    { value: 7, label: 'Şüpheli Durum' },
  ];
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onShare && onShare({ content, kategori: Number(kategori), title: title.trim(), mahalleId });
    setTitle('');
    setContent('');
    setKategori(0);
  };
  return (
    <form className="civar-post-share-box" onSubmit={handleSubmit}>
      <select
        className="civar-post-category-select"
        value={kategori}
        onChange={e => setKategori(e.target.value)}
        style={{ marginBottom: 10 }}
      >
        {kategoriler.map(k => (
          <option key={k.value} value={k.value}>{k.label}</option>
        ))}
      </select>
      {mahalleName && (
        <div style={{
          marginBottom: 10,
          fontWeight: 600,
          color: '#179c5a',
          fontSize: '.97rem',
          background: '#eaf6ef',
          borderRadius: 8,
          padding: '7px 12px',
          border: '1.5px solid #c7e7d2',
          letterSpacing: '.02em',
          textAlign: 'center'
        }}>
          {mahalleName}
        </div>
      )}
      <input
        className="civar-post-input"
        placeholder="Başlık..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={60}
        style={{marginBottom:8}}
      />
      <textarea
        className="civar-post-input"
        placeholder="Mahallene bir şeyler yaz..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
      />
      <div className="civar-post-actions civar-post-actions-center">
        <button type="submit" className="civar-share-btn">Paylaş</button>
      </div>
    </form>
  );
}
