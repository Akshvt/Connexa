import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';

// Placeholder for the main dashboard (to be built next)
function DashboardPlaceholder() {
  return (
    <div style={{ padding: '40px', color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: 'var(--color-jade)' }}>Namhya LeadFlow</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Dashboard coming soon.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <DashboardPlaceholder />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
