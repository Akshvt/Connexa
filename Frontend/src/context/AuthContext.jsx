import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('token');
    const expiry = localStorage.getItem('token_expiry');

    if (stored) {
      // Check if session has expired (default 7 days)
      if (expiry && Date.now() > Number(expiry)) {
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
      } else {
        setToken(stored);
      }
    }
    setLoading(false);
  }, []);

  function login(newToken, sessionDays = 7) {
    const expiry = Date.now() + sessionDays * 24 * 60 * 60 * 1000;
    localStorage.setItem('token', newToken);
    localStorage.setItem('token_expiry', String(expiry));
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    setToken(null);
  }

  // Derive a simple user object from the presence of a token
  const user = token ? { authenticated: true } : null;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
