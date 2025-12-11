// src/pages/Auth.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMailOutline, IoLockClosedOutline, IoArrowBackOutline, IoPersonOutline } from 'react-icons/io5'; 
import axios from 'axios'; 

// NOTE ON TAILWIND: For these dynamic colors to work reliably, 
// you must either explicitly add the full class names (e.g., 'bg-blue-600') to your 
// tailwind.config.js safelist, or use hardcoded classes as shown below.
const primaryColor = 'blue-600'; 
const primaryColorHover = 'blue-700';
const BASE_URL = 'http://localhost:5000'; 

// AuthInput component
const AuthInput = ({ name, placeholder, type = 'text', icon: Icon, formData, handleChange }) => (
    <div className="relative mb-4">
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={formData[name] || ''}
            onChange={handleChange}
            required={name !== 'firstName' && name !== 'lastName'}
            // Using hardcoded blue classes to ensure Tailwind works
            className={`w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-blue-600 focus:border-blue-600`}
        />
        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    </div>
);


const Auth = ({ type }) => {
    const isLogin = type === 'login';
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const endpoint = isLogin ? '/api/users/login' : '/api/users/signup';
        const url = `${BASE_URL}${endpoint}`;

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Error: Passwords do not match.');
            return;
        }
        
        try {
            const { data } = await axios.post(url, formData, {
                headers: { 'Content-Type': 'application/json' },
            });

            localStorage.setItem('token', data.token);
            navigate('/dashboard'); 
            
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Network Error: Check if backend is running on 5000.';
            setError(`Authentication failed: ${errorMessage}`);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side: Form Container */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white relative">
                <div className="w-full max-w-md">
                    
                    {/* 1. BACK TO HOME LINK */}
                    <Link 
                        to="/" // <-- Always links to the home page (/)
                        className={`absolute top-4 left-4 p-2 rounded-full text-blue-600 hover:bg-gray-100 transition-colors`}
                        aria-label="Go back to home"
                    >
                        <IoArrowBackOutline className="w-6 h-6" />
                    </Link>

                    {/* Header */}
                    <h1 className="text-3xl font-bold text-gray-800 mt-10 mb-2">
                        {isLogin ? 'Welcome Back!' : 'Create an Account'}
                    </h1>
                    <p className="text-gray-500 mb-8">
                        {isLogin ? 'Sign in to access your dashboard.' : 'Enter your details to get started.'}
                    </p>

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        
                        {!isLogin && (
                            <div className="flex space-x-4">
                                <AuthInput name="firstName" placeholder="First Name (Optional)" icon={IoPersonOutline} formData={formData} handleChange={handleChange} />
                                <AuthInput name="lastName" placeholder="Last Name (Optional)" icon={IoPersonOutline} formData={formData} handleChange={handleChange} />
                            </div>
                        )}
                        
                        <AuthInput name="email" placeholder="Email Address" type="email" icon={IoMailOutline} formData={formData} handleChange={handleChange} />
                        <AuthInput name="password" placeholder="Enter your password" type="password" icon={IoLockClosedOutline} formData={formData} handleChange={handleChange} />

                        {!isLogin && (
                            <AuthInput name="confirmPassword" placeholder="Confirm Password" type="password" icon={IoLockClosedOutline} formData={formData} handleChange={handleChange} />
                        )}

                        {isLogin && (
                            <div className="text-right mb-6">
                                <Link to="/forgot-password" className={`text-sm text-blue-600 hover:underline`}>Forgot Password?</Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`w-full py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors`}
                        >
                            {isLogin ? 'Login Now' : 'Signup Now'}
                        </button>
                    </form>

                    {/* OR divider and Signup/Login Link */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <Link 
                        to={isLogin ? '/signup' : '/login'}
                        className={`w-full block text-center py-3 border border-blue-600 text-blue-600 text-lg font-semibold rounded-lg shadow-sm hover:bg-blue-50 transition-colors`}
                    >
                        {isLogin ? 'Create Account' : 'Login to Existing Account'}
                    </Link>
                </div>
            </div>

            {/* Right Side: Illustration/Image */}
            <div className={`hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center p-8`}>
                <div className={`text-blue-600 text-center`}>
                    <IoLockClosedOutline className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">Secure Authentication</h2>
                    <p className="text-gray-600">Your privacy and data security are our priority.</p>
                </div>
            </div>
        </div>
    );
};

export default Auth;