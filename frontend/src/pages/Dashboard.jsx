import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { IoNotificationsOutline, IoHelpCircleOutline } from 'react-icons/io5';
import React from 'react';

const DashboardLayout = () => {
    const location = useLocation();
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const currentPage = pathSegments.length > 1 ? pathSegments[1] : 'Dashboard';

    // Function to capitalize and format the page title
    const formatTitle = (path) => {
        return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="flex min-h-screen bg-app-bg">
            <Sidebar />
            
            <div className="flex flex-col flex-grow">
                {/* Top Header Bar */}
                <header className="flex justify-between items-center bg-white p-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">{formatTitle(currentPage)}</h1>
                    
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <IoNotificationsOutline className="w-6 h-6" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <IoHelpCircleOutline className="w-6 h-6" />
                        </button>
                        {/* User Avatar Placeholder (Assuming the image is a placeholder) */}
                        <div className="w-9 h-9 bg-gray-300 rounded-full overflow-hidden">
                            <img src="/user-avatar.jpg" alt="User" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-grow p-6 overflow-auto">
                    <Outlet /> {/* Renders the nested route component (List, Groups, Courses, Profile) */}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;