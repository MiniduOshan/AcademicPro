// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import Header, Footer, and Page components
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import About from './pages/about.jsx';
import Contact from './pages/contact.jsx';

import LandingPage from './pages/LandingPage.jsx';
import Auth from './pages/Auth.jsx';

import DashboardLayout from './dashboard/Dashboard.jsx';
import DashboardSummary from './dashboard/DashboardSummary.jsx';
import List from './dashboard/List.jsx';
import MyGroups from './dashboard/MyGroups.jsx';
import GroupDetails from './dashboard/GroupDetails.jsx';
import Courses from './dashboard/Courses.jsx';
import Profile from './dashboard/Profile.jsx';
import CourseDetails from './dashboard/CourseDetails.jsx';


// Simple Auth Check Simulation
const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Layout component to wrap public pages with both Header AND Footer
const PublicLayout = () => (
    <div className="flex flex-col min-h-screen">
        <Header />
        {/* The main content area that renders the child route */}
        <main className="flex-grow">
            <Outlet />
        </main>
        <Footer />
    </div>
);

function App() {
    return (
        <> 
            <Routes>
                
                {/* 1. INDEPENDENT AUTH PAGES (NO Header/Footer Layout) */}
                
                {/* Login Page: Independent */}
                <Route path="/login" element={<Auth type="login" />} />
                
                {/* Signup Page: Now independent, outside the PublicLayout */}
                <Route path="/signup" element={<Auth type="signup" />} />
                
                
                {/* 2. PUBLIC PAGES (Routes that **SHOULD** have the Header and Footer via PublicLayout) */}
                <Route element={<PublicLayout />}>
                    {/* These pages use the Header and Footer */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<About />} /> 
                    <Route path="/contact" element={<Contact />} />
                </Route>

                {/* 3. PROTECTED ROUTES (Routes using DashboardLayout - No public Header/Footer) */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Nested Routes inside the DashboardLayout */}
                    <Route index element={<DashboardSummary />} /> 
                    <Route path="list" element={<List />} />
                    <Route path="my-groups" element={<MyGroups />} />
                    <Route path="my-groups/:groupId" element={<GroupDetails />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="courses/:courseId" element={<CourseDetails />} />
                    <Route path="profile" element={<Profile />} />
                </Route>

                {/* Catch-all for 404 */}
                <Route path="*" element={<h1 className="text-4xl text-center p-10">404 - Not Found</h1>} />
            </Routes>
        </>
    );
}

export default App;