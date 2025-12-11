import { Link } from 'react-router-dom';
import React from 'react';
// 1. Import icons from react-icons (Feather set used here)
import { FiUsers, FiClipboard, FiFolder } from 'react-icons/fi';

// Define the primary color for consistent styling
const PRIMARY_COLOR = 'indigo'; // e.g., text-indigo-600, bg-indigo-600

// --- Icon Components ---
// These are created to allow passing the 'color' prop (from PRIMARY_COLOR) 
// and maintain consistency with the FeatureCard component structure.

// Icon 1: For 'Seamless Group Management'
const UsersIcon = ({ color }) => (
    <FiUsers className={`text-${color}-600`} size={24} />
);

// Icon 2: For 'Kanban Task Flow'
const BoardIcon = ({ color }) => (
    <FiClipboard className={`text-${color}-600`} size={24} />
);

// Icon 3: For 'Secure File Sharing'
const FolderIcon = ({ color }) => (
    <FiFolder className={`text-${color}-600`} size={24} />
);
// -----------------------


const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50"> 

            {/* 1. Hero Section (Visual and High-Impact) */}
            <main className="max-w-7xl mx-auto py-20 px-6 md:flex md:items-center md:justify-between">
                <div className="md:w-6/12">
                    <p className={`text-sm font-semibold uppercase tracking-wider text-${PRIMARY_COLOR}-600`}>
                        Academic Collaboration Made Easy
                    </p>
                    <h1 className="mt-2 text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
                        Master Your Projects. <span className={`text-${PRIMARY_COLOR}-600`}>Achieve Success.</span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-600 max-w-lg">
                        Organize tasks, collaborate with group members, and track every academic deadline seamlessly in one powerful platform.
                    </p>
                    {/* Primary CTA Button (Large and prominent) */}
                    <Link 
                        to="/signup" 
                        className={`mt-10 inline-block px-10 py-4 bg-${PRIMARY_COLOR}-600 text-white text-lg font-bold rounded-xl shadow-2xl hover:bg-${PRIMARY_COLOR}-700 transition-all duration-300 ease-in-out transform hover:scale-[1.02]`}
                    >
                        Start Your Task
                    </Link>
                </div>
                
                {/* Visual side of the Hero Section */}
                <div className="md:w-5/12 mt-12 md:mt-0 flex justify-center">
                    {/* Informative Illustration Container (UPDATED) */}
                    <div>
                        {/* Placeholder for the Image/Illustration */}
                        {/* Replace the src with your actual image file path */}
                        <img 
                            src="landing.jpg" 
                            alt="A project management dashboard showing tasks and team collaboration for academic work" 
                            className="w-full h-full object-cover" 
                        />
                        

                    </div>
                </div>
            </main>

            {/* 2. Features Section (Value Proposition) */}
            <section className="bg-white max-w-7xl mx-auto py-20 px-6 mt-16 rounded-t-3xl shadow-inner">
                <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
                    Everything Your Team Needs
                </h2>
                    <p className="text-xl text-center text-gray-500 mb-16">
                    Tools to keep your academic work structured and stress-free.
                </p>
                <div className="grid md:grid-cols-3 gap-10">
                    <FeatureCard 
                        title="Seamless Group Management" 
                        description="Easily create, join, and manage all your project teams and member roles."
                        // Icon component inserted here
                        icon={<UsersIcon color={PRIMARY_COLOR} />}
                    />
                    <FeatureCard 
                        title="Kanban Task Flow" 
                        description="Visualize your project progress with intuitive, drag-and-drop task boards."
                        // Icon component inserted here
                        icon={<BoardIcon color={PRIMARY_COLOR} />}
                    />
                    <FeatureCard 
                        title="Secure File Sharing" 
                        description="Upload, share, and access all project resources and documents securely in one place."
                        // Icon component inserted here
                        icon={<FolderIcon color={PRIMARY_COLOR} />}
                    />
                </div>
            </section>
        </div>
    );
};

// Component for a styled Feature Card
const FeatureCard = ({ title, description, icon }) => (
    <div className="p-8 h-full bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
        {/*
          Added 'mx-auto' to center the div horizontally.
          'flex items-center justify-center' already centers the icon vertically and horizontally *within* its own 12x12 container.
        */}
        <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-${icon.props.color}-100 mx-auto`}>
           {icon} {/* Use the icon component directly */}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mt-6 text-center">{title}</h3>
        <p className="text-gray-600 mt-3 text-center">{description}</p>
    </div>
);


export default LandingPage;