import { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      const token = localStorage.getItem('admin_token');
      if (saved && token) {
        api.setToken(token);
        return JSON.parse(saved);
      }
    } catch { }
    return null;
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.login(username, password);
      api.setToken(data.access_token);
      localStorage.setItem('admin_token', data.access_token);

      const me = await api.getMe();
      if (!me?.is_superuser) {
        throw new Error('Superuser access only');
      }

      const userInfo = {
        id: me.id,
        username: me.username,
        is_superuser: true,
      };
      setUser(userInfo);
      localStorage.setItem('admin_user', JSON.stringify(userInfo));
      return true;
    } catch (err) {
      // Ensure we don't keep a token for non-superusers / failed logins.
      api.clearToken();
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setUser(null);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try { await api.logout(); } catch { }
    api.clearToken();
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, error, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
