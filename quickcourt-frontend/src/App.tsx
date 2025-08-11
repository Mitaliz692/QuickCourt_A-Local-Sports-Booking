import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './utils/theme';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import VenueDetails from './pages/VenueDetails';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import EmailVerification from './components/auth/EmailVerification';
import FacilityOwnerDashboard from './pages/FacilityOwnerDashboard';
import FacilityRegistration from './pages/FacilityRegistration';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import BookingMenu from './pages/BookingMenu';
import VenueBooking from './pages/VenueBooking';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/venue/:venueId" element={<VenueDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            
            {/* Facility Owner Routes */}
            <Route 
              path="/facility-dashboard" 
              element={
                <ProtectedRoute requiredRole="facility_owner">
                  <FacilityOwnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/facility-registration" 
              element={
                <ProtectedRoute requiredRole="facility_owner">
                  <FacilityRegistration />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/facility-registration/:venueId" 
              element={
                <ProtectedRoute requiredRole="facility_owner">
                  <FacilityRegistration />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/book-venue" 
              element={
                <ProtectedRoute>
                  <BookingMenu />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/book-venue/:venueId" 
              element={
                <ProtectedRoute>
                  <VenueBooking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <div>Admin Dashboard - Coming Soon</div>
                </ProtectedRoute>
              } 
            />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
