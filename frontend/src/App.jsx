import React, { useState, useEffect } from 'react';
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import FlightSearch from './components/dashboard/FlightSearch'
import AdminPanel from './components/admin/AdminPanel'
import LandingPage from './components/LandingPage'
import axios from 'axios';
import { ToastProvider } from './components/ui/ToastNotification';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);

  // Cek jika sudah pernah login sebelumnya
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const res = await axios.get('http://localhost:3333/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setCurrentPage('search');
    } catch (err) {
      console.error("Fetch user error:", err.response?.data || err.message);
      localStorage.removeItem('token');
      setUser(null);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('landing');
  }

  const handleGetStarted = () => {
    setCurrentPage('login');
  }

  const renderContent = () => {
    // Landing Page
    if (currentPage === 'landing' && !user) {
      return <LandingPage onGetStarted={handleGetStarted} />;
    }

    // Jika sudah login, cek role
    if (user) {
      if (user.role === 'admin') {
        return <AdminPanel user={user} onLogout={handleLogout} />;
      }
      return (
        <FlightSearch
          user={user}
          token={localStorage.getItem('token')}
          onLogout={handleLogout}
          onUserUpdate={(updatedUser) => setUser(updatedUser)}
        />
      );
    }

    // Auth pages
    return (
      <div>
        {currentPage === 'login' ? (
          <Login onSwitch={() => setCurrentPage('register')} onLoginSuccess={fetchUser} />
        ) : (
          <Register onSwitch={() => setCurrentPage('login')} />
        )}
      </div>
    );
  };

  return (
    <ToastProvider>
      {renderContent()}
    </ToastProvider>
  );
}

export default App