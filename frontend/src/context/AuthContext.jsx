import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('library_user') || 'null'); } catch { return null; }
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('library_token');
    if (!token) { setChecking(false); return; }
    api('/auth/me').then(({ user: current }) => setUser(current))
      .catch(() => { localStorage.removeItem('library_token'); localStorage.removeItem('library_user'); setUser(null); })
      .finally(() => setChecking(false));
  }, []);

  async function login(membershipId, password) {
    const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ membershipId, password }) });
    localStorage.setItem('library_token', result.token);
    localStorage.setItem('library_user', JSON.stringify(result.user));
    setUser(result.user);
  }
  function logout() {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user');
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, checking, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
