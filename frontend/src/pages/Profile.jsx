import { IoPencilOutline } from 'react-icons/io5';
import { useState } from 'react';
import React from 'react';
const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'Your Name', // This should come from your backend context
        email: 'yourname@gmail.com',
        mobileNumber: 'Add number',
        location: 'USA',
    });

    const handleSave = (e) => {
        e.preventDefault();
        setIsEditing(false);
        // --- API Integration Placeholder ---
        console.log('Saving profile data:', profileData);
        alert('Profile Updated (Simulated)');
    };

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const ProfileField = ({ label, name, value }) => (
        <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 items-center">
            <label className="text-gray-500 font-medium">{label}</label>
            <div className="col-span-2">
                {isEditing ? (
                    <input
                        type={name === 'email' ? 'email' : 'text'}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                        disabled={name === 'email'} // Email often requires special verification to change
                    />
                ) : (
                    <p className="text-gray-800">{value}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Profile</h2>

            <div className="flex items-center mb-8 pb-4 border-b border-gray-100">
                {/* Avatar Placeholder */}
                <div className="w-20 h-20 bg-gray-300 rounded-full mr-6">
                    <img src="/user-avatar.jpg" alt="User" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                    <p className="text-lg font-semibold text-gray-800">{profileData.name}</p>
                    <p className="text-sm text-gray-500">{profileData.email}</p>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center text-primary-500 text-sm mt-1 hover:underline"
                    >
                        <IoPencilOutline className="w-4 h-4 mr-1" />
                        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSave}>
                <ProfileField label="Name" name="name" value={profileData.name} />
                <ProfileField label="Email account" name="email" value={profileData.email} />
                <ProfileField label="Mobile number" name="mobileNumber" value={profileData.mobileNumber} />
                <ProfileField label="Location" name="location" value={profileData.location} />

                {isEditing && (
                    <button
                        type="submit"
                        className="mt-8 px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors"
                    >
                        Save Change
                    </button>
                )}
            </form>
        </div>
    );
};

export default Profile;