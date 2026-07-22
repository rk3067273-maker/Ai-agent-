import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import ChatPage from '@/pages/ChatPage';
import WorkspacePage from '@/pages/WorkspacePage';
import ProvidersPage from '@/pages/ProvidersPage';
import SettingsPage from '@/pages/SettingsPage';
import AdminPage from '@/pages/AdminPage';
import ProjectGeneratorPage from '@/pages/ProjectGeneratorPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/generator" element={<ProjectGeneratorPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
