import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AppShell from './components/layout/AppShell.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import PipelinePage from './pages/PipelinePage.jsx';
import DocsPage from './pages/DocsPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/docs" element={<DocsPage />} />

            {/* Protected — all wrapped in AppShell */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AppShell>
                    <DashboardPage />
                  </AppShell>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <AppShell>
                    <AnalyticsPage />
                  </AppShell>
                </PrivateRoute>
              }
            />
            <Route
              path="/pipeline"
              element={
                <PrivateRoute>
                  <AppShell>
                    <PipelinePage />
                  </AppShell>
                </PrivateRoute>
              }
            />
            
            {/* Any unknown route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
