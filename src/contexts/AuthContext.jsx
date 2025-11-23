import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

import { API_BASE } from '../services/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  /* Sync localStorage when user changes */
  useEffect(() => {
    if (user) localStorage.setItem('currentUser', JSON.stringify(user));
    else localStorage.removeItem('currentUser');
  }, [user]);

  /* Validate persisted session */
  useEffect(() => {
    let mounted = true;

    const validate = async () => {
      try {
        const raw = localStorage.getItem('currentUser');
        if (!raw) return;

        const parsed = JSON.parse(raw);
        if (!parsed?.id) return;

        // helper: fetch a user/admin from backend
        const tryFetch = async (endpoint) => {
          try {
            const res = await fetch(`${API_BASE}/${endpoint}/${encodeURIComponent(parsed.id)}`);
            if (!res.ok) return null;
            return await res.json();
          } catch {
            return null;
          }
        };

        let fresh =
          (await tryFetch("users")) ||
          (await tryFetch("admins"));

        // If user/admin not found → remove session
        if (!fresh) {
          if (mounted) {
            setUser(null);
            toast.info("Session ended: user not found.");
          }
          return;
        }

        // If user is blocked → logout
        if (fresh.isBlock) {
          if (mounted) {
            setUser(null);
            try { localStorage.removeItem('currentUser'); } catch { }
            toast.error("Your account has been blocked — you have been logged out.");
          }
          return;
        }

        // Remove password before storing
        const refreshedSafe = { ...fresh };
        if (refreshedSafe.password) delete refreshedSafe.password;

        if (mounted) setUser(refreshedSafe);

      } catch (err) {
        console.error("Error validating session:", err);
      }
    };

    validate();
    return () => { mounted = false; };
  }, []);

  const login = (u) => setUser(u);

  const logout = () => {
    try { localStorage.removeItem('currentUser'); } catch { }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}