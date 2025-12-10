// --- src/pages/Auth.jsx (FIXED) ---

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMailOutline, IoLockClosedOutline } from 'react-icons/io5';
import axios from 'axios'; // <--- NEW: Import Axios

// Backend URL constant (Adjust port if necessary, e.g., 3000)
const BASE_URL = 'http://localhost:5000'; 

// AuthInput component (Moved outside, kept the same)
const AuthInput = ({ name, placeholder, type = 'text', icon: Icon, formData, handleChange }) => (
    <div className="relative mb-4">
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={formData[name] || ''}
            onChange={handleChange}
            required
            className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const endpoint = isLogin ? '/api/users/login' : '/api/users/signup';
        const url = `${BASE_URL}${endpoint}`; // Use the defined BASE_URL

        // Check if passwords match only during signup
        if (!isLogin && formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        try {
            // Send request to the backend
            const { data } = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log("Authentication Successful. Data received:", data);

            // Store token and redirect
            localStorage.setItem('token', data.token);
            navigate('/dashboard'); 
            
        } catch (error) {
            // Log the detailed error from the backend for debugging
            const errorMessage = error.response?.data?.message || 'Network Error: Check if backend is running on 5000.';
            console.error('Auth failed:', error.response || error);
            alert(`Authentication failed: ${errorMessage}`);
        }
    };

    return (
        // ... (rest of the component JSX remains the same) ...
        <div className="min-h-screen flex">
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* ... (Header) ... */}
                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="flex space-x-4 mb-4">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-1/2 py-3 px-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-1/2 py-3 px-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        )}
                        
                        <AuthInput name="email" placeholder="Email Address" type="email" icon={IoMailOutline} formData={formData} handleChange={handleChange} />
                        <AuthInput name="password" placeholder="Enter your password" type="password" icon={IoLockClosedOutline} formData={formData} handleChange={handleChange} />

                        {!isLogin && (
                            <AuthInput name="confirmPassword" placeholder="Confirm Password" type="password" icon={IoLockClosedOutline} formData={formData} handleChange={handleChange} />
                        )}

                        {isLogin && (
                            <div className="text-right mb-6">
                                <Link to="/forgot-password" className="text-sm text-primary-500 hover:underline">Forgot Password?</Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 bg-primary-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors"
                        >
                            {isLogin ? 'Login Now' : 'Signup Now'}
                        </button>
                    </form>

                    {/* ... (OR divider and Signup/Login Link) ... */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <Link 
                        to={isLogin ? '/signup' : '/login'}
                        className="w-full block text-center py-3 border border-primary-500 text-primary-500 text-lg font-semibold rounded-lg shadow-sm hover:bg-primary-50 transition-colors"
                    >
                        {isLogin ? 'Signup Now' : 'Login Now'}
                    </Link>
                </div>
            </div>

            {/* Right Illustration/Image */}
            <div className="hidden md:flex md:w-1/2 bg-gray-100 items-center justify-center p-8">
                {/* Illustration Placeholder */}
            </div>
        </div>
    );
};

export default Auth;