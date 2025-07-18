import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ログイン前にアクセスしようとしていたページ
  const from = location.state?.from?.pathname || '/';

  console.log('LoginPage rendered, isAuthenticated:', isAuthenticated);

  // ログイン済みの場合はリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setError('');
    
    try {
      // Hardcoded credentials
      if (username === 'admin' && password === 'jettest25@Jet') {
        console.log('Attempting login...');
        const success = login(username, password);
        if (success) {
          console.log('Login successful');
          // navigate は useEffect で実行される
        } else {
          setError('ログインに失敗しました');
        }
      } else {
        setError('IDまたはパスワードが違います');
      }
    } catch (err) {
      setError('ログインエラーが発生しました');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '300px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>ID:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>パスワード:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '5px' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button 
          type="submit" 
          disabled={isLoggingIn}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: isLoggingIn ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: isLoggingIn ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoggingIn ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
