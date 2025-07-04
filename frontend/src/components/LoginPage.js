import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Hardcoded credentials
    if (username === 'admin' && password === 'jettest25@Jet') {
      if (login(username, password)) {
        // ログイン成功時は AuthContext が自動的に認証状態を更新
      } else {
        setError('ログインに失敗しました');
      }
    } else {
      setError('IDまたはパスワードが違います');
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
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
          ログイン
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
