import { Link, useLocation } from 'react-router-dom';
import { IoGridOutline, IoListOutline, IoPeopleOutline, IoSchoolOutline, IoPersonOutline, IoLogOutOutline } from 'react-icons/io5';
import React from 'react';

const navItems = [
    { name: 'Dashboard', icon: IoGridOutline, path: '/dashboard/list' }, // List is the default dashboard view
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

    return (
        <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200 p-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 pb-8 border-b border-gray-100">
                <img src="/AcademicPro_Logo.svg" alt="AcademicPro Logo" className="w-8 h-8" /> {/* Use your logo path */}
                <span className="text-xl font-semibold text-gray-800">AcademicPro</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow pt-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        // Determine if the current path matches the link's path
                        const isActive = location.pathname.startsWith(item.path.split('/list')[0]);

                        return (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors 
                                        ${isActive
                                            ? 'bg-primary-500 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100'
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