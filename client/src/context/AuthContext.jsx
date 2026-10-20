import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Where each role should land after logging in
export function homePathFor(role) {
  return role === 'owner' ? '/owner' : '/stores';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check a saved token
  const [notice, setNotice] = useState(''); // e.g. "session expired" message for the login page

  // When the page loads, check whether the saved token is still valid
  useEffect(() => {
    async function checkSavedLogin() {
      if (!localStorage.getItem('token')) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('token'); // token is invalid or expired
      } finally {
        setLoading(false);
      }
    }
    checkSavedLogin();
  }, []);

  // api.js fires this event when the server rejects our token
  useEffect(() => {
    function handleExpired() {
      setUser(null);
      setNotice('Your session has expired. Please log in again.');
    }
    window.addEventListener('auth-expired', handleExpired);
    return () => window.removeEventListener('auth-expired', handleExpired);
  }, []);

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    setNotice('');
    return response.data.user;
  }

  async function register(formData) {
    const response = await api.post('/auth/register', formData);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    setNotice('');
    return response.data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setNotice('');
  }

  return (
    <AuthContext.Provider value={{ user, loading, notice, setNotice, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Small helper so components can write: const { user } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
