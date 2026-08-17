'use client';

import { createContext, useContext, useEffect, useState } from 'react';

 const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user object or null
  const [loading, setLoading] = useState(true); // loading state

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();

        if (data.success) {
          setUser(data.message);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
