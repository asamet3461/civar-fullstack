
import './App.css';
import './AppScrollFix.css';
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import RequireAuth from './components/auth/RequireAuth';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import HomePage from './pages/home/HomePage';
import PostsPage from './pages/posts/PostsPage';
import PostDetailPage from './pages/posts/PostDetailPage';
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';
import NeighborhoodsPage from './pages/neighborhoods/NeighborhoodsPage';
import ChatPage from './pages/chat/ChatPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import CivarMainPage from './pages/home/CivarMainPage';
import ProfileViewPage from './pages/ProfileViewPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import ApiTestPage from './pages/ApiTestPage';


function GoogleAuthRedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');
    const fullName = params.get('fullName');
    
    if (token && email) {
      
      const qs = new URLSearchParams();
      qs.set('email', email);
      if (fullName) qs.set('fullName', fullName);
      navigate('/register?' + qs.toString(), { replace: true });
      return;
    }
    
    if (token && !email) {
      localStorage.setItem('token', token);
      navigate('/ana-sayfa', { replace: true });
    }
  }, [location, navigate]);
  return null;
}

const queryClient = new QueryClient();

export default function App() {
  
  
  useEffect(() => {
    function onStorage(e) {
      if (!e) return;
      
      const watchKeys = ['token', 'userActivityOverrides'];
      if (watchKeys.includes(e.key)) {
        try {
          queryClient.invalidateQueries({ queryKey: ['userActivity'] });
        } catch (err) {
          
        }
      }
    }
    window.addEventListener('storage', onStorage);
    
    let bc = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('civar-user-activity');
        bc.onmessage = (ev) => {
          try {
            const msg = ev.data;
            if (msg && msg.type === 'userActivityOverride') {
              
              queryClient.invalidateQueries({ queryKey: ['userActivity'] });
            }
          } catch (er) {}
        };
      }
    } catch (e) {}

    
    const cleaner = setInterval(() => {
      try {
        const raw = localStorage.getItem('userActivityOverrides');
        if (!raw) return;
        const obj = JSON.parse(raw) || {};
        const now = Date.now();
        let changed = false;
        for (const [k, v] of Object.entries(obj)) {
          if (v && v._ts && (now - v._ts) > 1000 * 60 * 10) { 
            delete obj[k];
            changed = true;
          }
        }
        if (changed) localStorage.setItem('userActivityOverrides', JSON.stringify(obj));
      } catch (e) {}
    }, 1000 * 60);
    return () => {
      window.removeEventListener('storage', onStorage);
      try { if (bc) bc.close(); } catch (e) {}
      clearInterval(cleaner);
    };
  }, []);
  return (
    <ApiProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/apitest" element={<ApiTestPage />} />
              {}
              <Route path="/auth-redirect" element={<GoogleAuthRedirectHandler />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/ana-sayfa" element={<CivarMainPage />} />
              <Route element={<Layout />}>
                <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
                <Route path="/posts/:id" element={<RequireAuth><PostDetailPage /></RequireAuth>} />
                <Route path="/events" element={<RequireAuth><EventsPage /></RequireAuth>} />
                <Route path="/events/:id" element={<RequireAuth><EventDetailPage /></RequireAuth>} />
                <Route path="/neighborhoods" element={<RequireAuth><NeighborhoodsPage /></RequireAuth>} />
                <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
                <Route path="/chat/:userId" element={<RequireAuth><ChatPage /></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><ProfileViewPage /></RequireAuth>} />
                <Route path="/profile/:userId" element={<RequireAuth><ProfileViewPage /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><ProfileSettingsPage /></RequireAuth>} />
                <Route path="/settings/account" element={<RequireAuth><AccountSettingsPage /></RequireAuth>} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </AuthProvider>
    </ApiProvider>
  );
}
