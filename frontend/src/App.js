import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Chat from './components/Chat';
import UploadQAForm from './components/UploadQAForm';
import UploadPDFForm from './components/UploadPDFForm';
import UploadURLForm from './components/UploadURLForm';
import UploadURLsForm from './components/UploadURLsForm';
import UploadSitemapForm from './components/UploadSitemapForm';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AzureChat from './components/AzureChat';
import LearningIndex from './components/LearningIndex';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function AppContent() {
  const { isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          isAuthenticated ? (
            <>
              <aside className="sidebar">
                <h1>うちのAI</h1>
                <nav>
                  <ul>
                    <li><Link to="/">テスト用チャット</Link></li>
                    {/* <li><Link to="/azure_chat">Azure Chat</Link></li> */}
                    <li><Link to="/upload">一問一答アップロード</Link></li>
                    <li><Link to="/upload_pdf">PDFアップロード</Link></li>
                    <li><Link to="/upload_url">URLデータアップロード</Link></li>
                    <li><Link to="/upload_urls">複数URLデータアップロード</Link></li>
                    <li><Link to="/upload_sitemap">サイトマップURLアップロード</Link></li>
                    <li><Link to="/learning_index">学習データ一覧</Link></li>
                  </ul>
                </nav>
                <button onClick={logout} className="logout-button">
                  ログアウト
                </button>
              </aside>
              <main className="main-content">
                <Routes>
                  <Route path="/azure_chat" element={<ProtectedRoute><AzureChat /></ProtectedRoute>} />
                  <Route path="/upload" element={<ProtectedRoute><UploadQAForm /></ProtectedRoute>} />
                  <Route path="/upload_pdf" element={<ProtectedRoute><UploadPDFForm /></ProtectedRoute>} />
                  <Route path="/upload_url" element={<ProtectedRoute><UploadURLForm /></ProtectedRoute>} />
                  <Route path="/upload_urls" element={<ProtectedRoute><UploadURLsForm /></ProtectedRoute>} />
                  <Route path="/upload_sitemap" element={<ProtectedRoute><UploadSitemapForm /></ProtectedRoute>} />
                  <Route path="/learning_index" element={<ProtectedRoute><LearningIndex /></ProtectedRoute>} />
                  <Route path="/" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                </Routes>
              </main>
            </>
          ) : (
            <LoginPage />
          )
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

