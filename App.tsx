import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DailyTrack from './pages/DailyTrack';
import AICoach from './pages/AICoach';
import Profile from './pages/Profile';
import Community from './pages/Community';
import SharePreview from './pages/SharePreview';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center bg-app-bg text-app-text">Loading X4U Bio...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
             <Route path="/track" element={
              <ProtectedRoute>
                <DailyTrack />
              </ProtectedRoute>
            } />
             <Route path="/coach" element={
              <ProtectedRoute>
                <AICoach />
              </ProtectedRoute>
            } />
             <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            <Route path="/share" element={
              <ProtectedRoute>
                <SharePreview />
              </ProtectedRoute>
            } />
             <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
