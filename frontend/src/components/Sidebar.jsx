import { Link, useLocation } from 'react-router-dom';
import { IoGridOutline, IoListOutline, IoPeopleOutline, IoSchoolOutline, IoPersonOutline, IoLogOutOutline } from 'react-icons/io5';
import React from 'react';

const navItems = [
    { name: 'Dashboard', icon: IoGridOutline, path: '/dashboard' }, 
    { name: 'List', icon: IoListOutline, path: '/dashboard/list' },
    { name: 'My Groups', icon: IoPeopleOutline, path: '/dashboard/my-groups' },
    { name: 'Courses', icon: IoSchoolOutline, path: '/dashboard/courses' },
    { name: 'Profile', icon: IoPersonOutline, path: '/dashboard/profile' },
];

const Sidebar = () => {
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token
        window.location.href = '/login'; // Redirect to login
    };

    // Calculate if any *sub-route* of Dashboard is currently active
    const isSubRouteActive = navItems.some(item => 
        item.path !== '/dashboard' && location.pathname.startsWith(item.path)
    );
    
    return (
        <div className="flex flex-col h-screen w-64 bg-gray-300 border-r border-gray-200 p-4 z-10">
            {/* Logo */}
            <div className="flex items-center space-x-2 pb-8 border-b border-gray-100">
                <img src="/logo.png" alt="AcademicPro Logo" className="w-8 h-8" /> 
                <span className="text-xl font-semibold text-gray-800">AcademicPro</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow pt-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        
                        let isActive = false;
                        
                        if (item.path === '/dashboard') {
                            // FIX: Only activate Dashboard if the path is exactly /dashboard (the index route)
                            // AND no other sub-route (like /dashboard/list) is active.
                            isActive = (location.pathname === '/dashboard' || location.pathname === '/dashboard/') && !isSubRouteActive;
                            
                        } else {
                            // For all sub-links, use startsWith for highlighting correctly
                            isActive = location.pathname.startsWith(item.path);
                        }

                        // Special case: If the path is /dashboard/list, the 'List' item should be active.
                        // Since List is defined as an item, the else block handles it correctly.
                        // We need to ensure the Dashboard index is only active when on the summary page.
                        if (item.path === '/dashboard') {
                            isActive = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
                        } else {
                            // For all other links, use startsWith
                            isActive = location.pathname.startsWith(item.path);
                        }
                        
                        // Final Refined Logic:
                        if (item.path === '/dashboard') {
                            // Dashboard is active IF the path is exactly /dashboard or /dashboard/ 
                            // AND NOT if the path starts with any of the sub-routes (e.g. /dashboard/list)
                            isActive = (location.pathname === '/dashboard' || location.pathname === '/dashboard/') && !isSubRouteActive;
                        } else {
                            // All specific sub-pages are active when the path starts with them.
                            isActive = location.pathname.startsWith(item.path);
                        }


                        return (
                            <li key={item.name} className="w-full">
                                <Link
                                    to={item.path}
                                    className={`flex items-center space-x-3 p-3 w-full rounded-lg transition-colors 
                                        ${isActive
                                            ? 'bg-primary-500 text-blue shadow-md'
                                            : 'text-gray-600 hover:text-primary-500 hover:bg-transparent'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Log out */}
            <div className="pt-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 p-3 w-full text-red-500 hover:bg-red-50 transition-colors rounded-lg"
                >
                    <IoLogOutOutline className="w-5 h-5" />
                    <span className="font-medium">Log out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;