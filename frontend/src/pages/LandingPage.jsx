import { Link } from 'react-router-dom';
import React from 'react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header/Navbar */}
            <header className="flex justify-between items-center p-6 border-b border-gray-100 max-w-7xl mx-auto">
                <div className="flex items-center space-x-2">
                    <img src="/AcademicPro_Logo.svg" alt="AcademicPro Logo" className="w-8 h-8" />
                    <span className="text-xl font-bold text-gray-800">AcademicPro</span>
                </div>
                <nav className="space-x-6 hidden md:flex">
                    <a href="#" className="text-gray-600 hover:text-primary-500 transition-colors">Home</a>
                    <a href="#" className="text-gray-600 hover:text-primary-500 transition-colors">About</a>
                    <a href="#" className="text-gray-600 hover:text-primary-500 transition-colors">Contact</a>
                    <Link to="/login" className="text-gray-600 hover:text-primary-500 transition-colors">Login</Link>
                </nav>
                <Link to="/signup" className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    Get Start
                </Link>
            </header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto py-16 px-6 md:flex md:items-center">
                <div className="md:w-1/2">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Master Your Academic Project. <span className="text-primary-500">Together</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        organize with task collaborate with groups and track deadlines
                    </p>
                    <Link to="/signup" className="mt-8 inline-block px-8 py-3 bg-primary-500 text-white text-lg font-semibold rounded-lg shadow-xl hover:bg-primary-600 transition-colors">
                        Sign up now
                    </Link>
                </div>
                <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                    {/* Placeholder for the main illustration */}
                                    </div>
            </main>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto py-20 px-6">
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-12">Features</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard title="Group Management" description="create and join project teams" />
                    <FeatureCard title="Task Flow" description="organize with board" />
                    <FeatureCard title="File Sharing" description="upload and access resources" />
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ title, description }) => (
    <div className="p-6 h-64 bg-gray-100 rounded-xl shadow-lg flex flex-col justify-end">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
    </div>
);

export default LandingPage;