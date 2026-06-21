import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If token exists, load user profile from backend
    const fetchUser = async () => {
      if (token) {
        try {
          // Store token in LocalStorage
          localStorage.setItem('token', token);
          const response = await fetch('http://127.0.0.1:5000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const resData = await response.json();
          if (resData.success) {
            setUser(resData.data);
          } else {
            // Token invalid or expired
            logout();
          }
        } catch (error) {
          console.error('Failed to load user profile:', error.message);
          // Don't auto logout on temporary network loss, only on 401 response.
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
