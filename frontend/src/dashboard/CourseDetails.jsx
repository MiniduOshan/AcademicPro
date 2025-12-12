import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { IoArrowBackOutline, IoPersonOutline, IoPencil, IoSaveOutline } from 'react-icons/io5'; 
// Assuming Modal is also imported if needed, but not shown here

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for editing
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ title: '', code: '', description: '' });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Get current user ID (used for the creator check later)
    const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).id : '';
    

    const fetchCourse = async () => {
        try {
            const { data } = await api.get(`/api/courses/${courseId}`, config);
            setCourse(data);
            setError(null);
            
            // Initialize form data when course is fetched
            setFormData({ 
                title: data.title, 
                code: data.code, 
                description: data.description 
            });

        } catch (err) {
            console.error("Failed to fetch course details:", err);
            const message = err.response?.data?.message || "Course not found or server error.";
            setError(message);
            
            if (err.response?.status === 404) {
                alert(message);
                navigate('/dashboard/courses');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [courseId, token]);

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission (Update/PUT request)
    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.code) {
            alert("Title and Code are required.");
            return;
        }

        try {
            const { data: updatedCourse } = await api.put(
                `/api/courses/${courseId}`, 
                formData, 
                config
            );
            
            setCourse(updatedCourse);
            setIsEditing(false);
            alert("Course updated successfully!");

        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update course: " + (err.response?.data?.message || err.message));
        }
    };


    if (loading) return <div className="text-center p-10">Loading Course Details...</div>;
    if (error && !course) return <div className="text-center p-10 text-red-500">{error}</div>;
    if (!course) return <div className="text-center p-10 text-red-500">Course data unavailable.</div>;

    // FIX: Define isCreator here, after 'course' is guaranteed to be non-null
    const isCreator = course.addedBy?._id === currentUserId;


    // --- RENDER LOGIC ---
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <button 
                    onClick={() => navigate('/dashboard/courses')}
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-500 transition-colors"
                >
                    <IoArrowBackOutline className="w-5 h-5" />
                    <span>Back to Courses</span>
                </button>
                
                {/* Edit Button (Only visible to the creator - now correctly calculated) */}
                {isCreator && (
                    <button 
                        onClick={isEditing ? handleUpdate : () => setIsEditing(true)}
                        className={`px-4 py-2 rounded-lg text-black font-medium transition-colors flex items-center space-x-2 
                            ${isEditing ? 'text-white bg-green-500 hover:bg-green-600' : 'bg-primary-500 hover:bg-primary-600'}`}
                        disabled={isEditing && (!formData.title || !formData.code)}
                    >
                        {isEditing ? (
                            <>
                                <IoSaveOutline className="w-5 h-5" />
                                <span>Save Changes</span>
                            </>
                        ) : (
                            <>
                                <IoPencil className="w-5 h-5" />
                                <span>Edit Course</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Course Content Area - Uses form/inputs if editing, otherwise static text */}
            <form onSubmit={handleUpdate}>
                <div className="border-b pb-4 mb-6">
                    {/* Course Code */}
                    <span className="text-lg font-semibold text-primary-600 bg-primary-100 px-3 py-1 rounded-full mb-2 inline-block">
                        {isEditing ? (
                            <input 
                                type="text" 
                                name="code" 
                                value={formData.code} 
                                onChange={handleChange} 
                                className="border-b border-gray-400 bg-transparent font-normal w-24 focus:outline-none"
                                required 
                            />
                        ) : (
                            course.code
                        )}
                    </span>
                    
                    {/* Course Title */}
                    <h1 className="text-3xl font-extrabold text-gray-800 mt-1">
                        {isEditing ? (
                            <input 
                                type="text" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                className="border-b border-gray-400 w-full focus:outline-none"
                                required 
                            />
                        ) : (
                            course.title
                        )}
                    </h1>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Course Description</h2>
                    
                    {isEditing ? (
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    ) : (
                        <p className="text-gray-600 text-base leading-relaxed">{course.description}</p>
                    )}
                </div>
            </form>
            
            {/* Administration Details (Visible regardless of edit mode)
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Administration</h2>
                <div className="flex items-center space-x-3 text-gray-600">
                    <IoPersonOutline className="w-5 h-5" />
                    <span>
                        Added by: 
                        <span className="font-medium ml-1">
                             {course.addedBy?.firstName || 'Unknown'} {course.addedBy?.lastName || 'User'}
                        </span>
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Date Added: {new Date(course.createdAt).toLocaleDateString()}
                </p>
            </div>

            Optional: Placeholder (Retained)
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700">Related Activities</h3>
                <p className="text-sm text-gray-500">Future implementation: Show group assignments or discussion threads related to this course.</p>
            </div> */}
        </div>
    );
};

export default CourseDetails;