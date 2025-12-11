import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
      return (
            <header className="flex justify-between items-center p-6 border-b border-gray-100 max-w-7xl mx-auto">
                    
                <div className="flex items-center space-x-2">
                    <img src="/logo.png" alt="AcademicPro Logo" className="w-8 h-8" />
                    <span className="text-xl font-bold text-gray-800">AcademicPro</span>
                </div>
            
                  <nav className="space-x-6 hidden md:flex mr-0.5">
                        <Link to="/" className="text-gray-600 hover:text-primary-500 transition-colors">Home</Link>
                        <Link to="/about" className="text-gray-600 hover:text-primary-500 transition-colors">About</Link>
                        <Link to="/contact" className="text-gray-600 hover:text-primary-500 transition-colors">Contact</Link>
                        <Link to="/login" className="text-gray-600 hover:text-primary-500 transition-colors">Login</Link>     
                  </nav>
                  <Link to="/signup" className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                        Get Started
                  </Link>
            </header>
      );
}

export default Header;