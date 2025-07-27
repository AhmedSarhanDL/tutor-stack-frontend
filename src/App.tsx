import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ChatPage from './components/ChatPage';
import PdfUploadPage from './components/PdfUploadPage';
import CurriculumViewer from './components/CurriculumViewer';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorDisplay from './components/ErrorDisplay';
import TestPage from './components/TestPage';
import './App.css';

// Component to handle conditional routing
function AppRoutes() {
  const { user, isLoading, error, clearError } = useAuth();

  console.log('AppRoutes render - user:', user, 'isLoading:', isLoading, 'error:', error);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#4a5568'
      }}>
        Loading Tutor Stack...
      </div>
    );
  }

  // If not authenticated, redirect to login for ALL routes except /login
  if (!user) {
    console.log('AppRoutes: User not authenticated, redirecting to login');
    return (
      <>
        <ErrorDisplay error={error} onClear={clearError} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </>
    );
  }

  // If authenticated, show protected routes
  console.log('AppRoutes: User authenticated, showing protected routes');
  return (
    <>
      <ErrorDisplay error={error} onClear={clearError} />
      <Routes>
        {/* Redirect from login to dashboard if already authenticated */}
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/pdf-upload" element={<PdfUploadPage />} />
        <Route path="/curriculum" element={<CurriculumViewer />} />
        <Route path="/test" element={<TestPage />} />
        
        {/* Default redirects for authenticated users */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
