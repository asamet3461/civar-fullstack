import React from "react";
import { FaUser, FaLock, FaBell, FaMoon, FaPlusCircle, FaRegCommentDots, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/civar-logo.png";
import "./ProfileSettingsPage.css";

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="profile-container">
      <aside className="sidebar">
        <div className="logo-area" style={{cursor:'pointer'}} onClick={() => navigate('/ana-sayfa') }>
          <img src={logo} alt="Civar Logo" className="logo-img" />
          <span className="logo-text">Civar</span>
        </div>
        <nav className="sidebar-nav">
          {}
        </nav>
        <div className="sidebar-bottom">
          {}
        </div>
      </aside>
      <main className="settings-main">
        <div className="settings-container">
          <h2 className="settings-title">Ayarlar</h2>
          <div className="settings-list">
            <button className="settings-item" onClick={() => navigate('/settings/account')}>
              <FaUser className="settings-icon" /> Hesap ayarları
              <span className="settings-arrow">&gt;</span>
            </button>
            <button className="settings-item">
              <FaLock className="settings-icon" /> Gizlilik ayarları
              <span className="settings-arrow">&gt;</span>
            </button>
            <button className="settings-item">
              <FaBell className="settings-icon" /> Bildirim ayarları
              <span className="settings-arrow">&gt;</span>
            </button>
            <button className="settings-item">
              <FaMoon className="settings-icon" /> Tema: Açık Mod
              <span className="settings-arrow">&gt;</span>
            </button>
            <button className="settings-item">
              <FaPlusCircle className="settings-icon" /> İşletme sayfası ekle
              <span className="settings-arrow">&gt;</span>
            </button>
          </div>
          <div className="settings-links">
            <a href="#" className="settings-link">Gizlilik politikası</a>
            <a href="#" className="settings-link">Üyelik sözleşmesi</a>
            <button className="settings-link logout">Çıkış yap</button>
          </div>
        </div>
      </main>
    </div>
  );
}
