import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

import { getProfile, logoutUser } from '../services/api';

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

        // 1. Call the new Profile endpoint to check the HttpOnly cookie
        const freshUser = await getProfile();

        if (freshUser) {
          // CHECK IF BLOCKED
          if (freshUser.isActive === false) {
            if (mounted) {
              setUser(null);
              localStorage.removeItem("currentUser");
              toast.error("Your account has been blocked.");
            }
            return;
          }
          if (mounted) {
            setUser(freshUser);
            localStorage.setItem('currentUser', JSON.stringify(freshUser));
          }
        } else {
          // 2. If cookie is missing/expired, logout the user
          if (mounted) {
            setUser(null);
            localStorage.removeItem('currentUser');
            toast.info("Session ended.");
          }
        }
      } catch (err) {
        console.error("Session validation error:", err);
        if (mounted) {
          setUser(null);
          localStorage.removeItem('currentUser');
        }
      }
    };

    validate();
    return () => { mounted = false; };
  }, []);

  const login = (u) => setUser(u);

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore — still clear local state even if the request fails
    }
    try { localStorage.removeItem('currentUser'); } catch { }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}