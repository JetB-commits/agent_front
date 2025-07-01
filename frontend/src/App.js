import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Chat from './components/Chat';
import ChatHistory from './ChatHistory';
import UploadQAForm from './components/UploadQAForm';
import UploadPDFForm from './components/UploadPDFForm';
import UploadURLForm from './components/UploadURLForm';
import UploadURLsForm from './components/UploadURLsForm';
import UploadSitemapForm from './components/UploadSitemapForm';
import './App.css';

function App() {
  return (
    <div>
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
        </ul>
      </nav>
      <Routes>
        <Route path="/history" element={<ChatHistory />} />
        <Route path="/upload" element={<UploadQAForm />} />
        <Route path="/upload_pdf" element={<UploadPDFForm />} />
        <Route path="/upload_url" element={<UploadURLForm />} />
        <Route path="/upload_urls" element={<UploadURLsForm />} />
        <Route path="/upload_sitemap" element={<UploadSitemapForm />} />
        <Route path="/" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
