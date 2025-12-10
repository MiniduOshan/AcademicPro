import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import all local page components with the .jsx extension
import LandingPage from './pages/LandingPage.jsx';
import Auth from './pages/Auth.jsx';
import DashboardLayout from './pages/Dashboard.jsx';
import List from './pages/List.jsx';
import MyGroups from './pages/MyGroups.jsx';
import Courses from './pages/Courses.jsx';
import Profile from './pages/Profile.jsx';


// Simple Auth Check Simulation
const isAuthenticated = () => {
    // In a real application, this would decode and validate a JWT
    return localStorage.getItem('token') !== null;
};

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
    // Note: The 'useState' import is now available but not strictly needed 
    // in App.jsx unless you add state here. It's included as it was in your imports.
    return (
      
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Auth type="login" />} />
                <Route path="/signup" element={<Auth type="signup" />} />

                {/* Protected Routes (Dashboard and its children) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Nested Routes inside the DashboardLayout */}
                    {/* The 'index' route makes 'list' the default view when navigating to /dashboard */}
                    <Route index element={<Navigate to="list" replace />} /> 
                    <Route path="list" element={<List />} />
                    <Route path="my-groups" element={<MyGroups />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                {/* Catch-all for 404 */}
                <Route path="*" element={<h1 className="text-4xl text-center p-10">404 - Not Found</h1>} />
            </Routes>
      
    );
}

export default App;