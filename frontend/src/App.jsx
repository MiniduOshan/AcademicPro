import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import all local page components with the .jsx extension
import LandingPage from './pages/LandingPage.jsx';
import Auth from './pages/Auth.jsx';
import DashboardLayout from './pages/Dashboard.jsx';
import DashboardSummary from './pages/DashboardSummary.jsx'; // Summary View
import List from './pages/List.jsx';
import MyGroups from './pages/MyGroups.jsx';
import GroupDetails from './pages/GroupDetails.jsx'; // Group Details View
import Courses from './pages/Courses.jsx';
import Profile from './pages/Profile.jsx';
// Note: We remove the global Header import to avoid duplicating the header bar inside DashboardLayout.

// Simple Auth Check Simulation
const isAuthenticated = () => {
    // In a real application, this checks if a valid JWT token exists
    return localStorage.getItem('token') !== null;
};

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
    // If authenticated, render children (the requested page); otherwise, redirect to login.
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
    return (
        // Note: The BrowserRouter should wrap this component in main.jsx/index.jsx
        <> 
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Auth type="login" />} />
                <Route path="/signup" element={<Auth type="signup" />} />

                {/* Protected Routes (Authenticated Access Only) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Nested Routes inside the DashboardLayout */}
                    
                    {/* 1. Dashboard Index: Shows the Summary/Indicators View */}
                    <Route index element={<DashboardSummary />} /> 
                    
                    {/* 2. Task List (Kanban Board) */}
                    <Route path="list" element={<List />} />
                    
                    {/* 3. Group Management: MyGroups component handles the list view */}
                    <Route path="my-groups" element={<MyGroups />} />
                    
                    {/* 4. Group Detail: Uses ':groupId' URL parameter for dynamic routing (Discussion Board) */}
                    <Route path="my-groups/:groupId" element={<GroupDetails />} />

                    {/* 5. Courses */}
                    <Route path="courses" element={<Courses />} />
                    
                    {/* 6. Profile */}
                    <Route path="profile" element={<Profile />} />
                </Route>

                {/* Catch-all for 404 */}
                <Route path="*" element={<h1 className="text-4xl text-center p-10">404 - Not Found</h1>} />
            </Routes>
        </>
    );
}

export default App;