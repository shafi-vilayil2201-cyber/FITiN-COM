import React, { createContext, useContext, useEffect, useState } from 'react';

const AdminAuthContext = createContext();

export function useAdminAuth() { return useContext(AdminAuthContext); }

export function AdminAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // Use the same key as the main AuthContext to stay in sync
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const login = (userObj) => setCurrentUser(userObj);

  const logout = () => {
    try { localStorage.removeItem('currentUser'); } catch (e) { }
    setCurrentUser(null);
  };

  const isAdmin = !!(currentUser && (
    currentUser.role?.toLowerCase() === 'admin' ||
    currentUser.Role?.toLowerCase() === 'admin' ||
    currentUser.isAdmin
  ));

  return (
    <AdminAuthContext.Provider value={{ currentUser, login, logout, isAdmin, loading, setLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}