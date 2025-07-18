import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージから認証状態を確認
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);  const login = (username, password) => {
    // 簡単な認証ロジック（実際の実装では適切な認証サーバーと連携）
    console.log('Login function called with:', username);
    if (username === 'admin' && password === 'jettest25@Jet') {
      console.log('Credentials are correct, setting authenticated to true');
      localStorage.setItem('authToken', 'dummy-token');
      setIsAuthenticated(true);
      console.log('isAuthenticated set to true');
      return true;
    }
    console.log('Credentials are incorrect');
    return false;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
