import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Chat from './components/Chat';
import ChatHistory from './ChatHistory';
import UploadQAForm from './components/UploadQAForm';
import UploadPDFForm from './components/UploadPDFForm';
import UploadURLForm from './components/UploadURLForm';
import UploadURLsForm from './components/UploadURLsForm';
import UploadSitemapForm from './components/UploadSitemapForm';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function AppContent() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated && (
        <nav>
          <ul>
            <li>
              <Link to="/">Chat</Link>
            </li>
            <li>
              <Link to="/history">Chat History</Link>
            </li>
            <li>
              <Link to="/upload">一問一答アップロード</Link>
            </li>
            <li>
              <Link to="/upload_pdf">PDFアップロード</Link>
            </li>
            <li>
              <Link to="/upload_url">URLデータアップロード</Link>
            </li>
            <li>
              <Link to="/upload_urls">複数URLデータアップロード</Link>
            </li>
            <li>
              <Link to="/upload_sitemap">サイトマップURLアップロード</Link>
            </li>
            <li>
              <button onClick={logout} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
                ログアウト
              </button>
            </li>
          </ul>
        </nav>
      )}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/history" element={
          <ProtectedRoute>
            <ChatHistory />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadQAForm />
          </ProtectedRoute>
        } />
        <Route path="/upload_pdf" element={
          <ProtectedRoute>
            <UploadPDFForm />
          </ProtectedRoute>
        } />
        <Route path="/upload_url" element={
          <ProtectedRoute>
            <UploadURLForm />
          </ProtectedRoute>
        } />
        <Route path="/upload_urls" element={
          <ProtectedRoute>
            <UploadURLsForm />
          </ProtectedRoute>
        } />
        <Route path="/upload_sitemap" element={
          <ProtectedRoute>
            <UploadSitemapForm />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
