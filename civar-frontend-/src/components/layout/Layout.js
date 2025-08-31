import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';
import { FaBell, FaRegCommentDots } from 'react-icons/fa';
import NotificationBadge from '../NotificationBadge';
import logo from '../../assets/civar-logo.png';
import UserMenu from '../UserMenu';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNav = location.pathname === '/login' || location.pathname === '/register';
  return (
    <div className="app-root">
      {!hideNav && (
        <nav className="top-nav minimal-nav">
          <div className="brand" style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={() => navigate('/ana-sayfa')}>
            <img src={logo} alt="Civar Logo" style={{height:'32px',width:'32px'}} />
            <span>Civar</span>
          </div>
          <div className="top-icons" style={{display:'flex',alignItems:'center',gap:'1.2rem',marginLeft:'auto',marginRight:'1.2rem'}}>
            <NotificationBadge icon={<FaBell size={28} className="nav-icon" />} />
            <FaRegCommentDots size={28} className="nav-icon" onClick={() => navigate('/chat')} title="Mesajlar" />
            <UserMenu />
          </div>
        </nav>
      )}
      <main className={!hideNav ? "main-content" : undefined}>
        <Outlet />
      </main>
    </div>
  );
}
