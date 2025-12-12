import React, { useState, useEffect, useMemo } from 'react';
import { IoSearchOutline, IoTrashBinOutline, IoEyeOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal.jsx';

// -------------------------
// COURSE CARD (UPDATED)
// -------------------------
const CourseCard = ({ course, onDelete, onView }) => {
    const currentUserId = localStorage.getItem('token')
        ? JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id
        : '';

    const isOwner = course.addedBy === currentUserId || course.addedBy?._id === currentUserId;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between max-w-[380px] overflow-hidden">
            <div className="flex justify-between items-start">
                <div className="min-w-0">
                    <span className="text-sm font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full mb-2 inline-block break-words">
                        {course.code}
                    </span>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 break-words line-clamp-1">
                        {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm break-words line-clamp-2">
                        {course.description}
                    </p>
                </div>

                <div className="flex space-x-2 text-gray-400 shrink-0">
                    <button onClick={() => onView(course._id)} className="hover:text-primary-500 p-1">
                        <IoEyeOutline className="w-5 h-5" />
                    </button>

                    {isOwner && (
                        <button onClick={() => onDelete(course._id)} className="hover:text-red-500 p-1">
                            <IoTrashBinOutline className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// -------------------------
// MAIN PAGE
// -------------------------
const Courses = () => {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('Latest');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', code: '', description: '' });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchCourses = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const { data } = await api.get('courses', config);
            setCourses(data);
        } catch (err) {
            console.error("Failed to fetch courses:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [token]);

    const filteredCourses = useMemo(() => {
        let current = [...courses];

        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            current = current.filter(c =>
                c.title.toLowerCase().includes(s) ||
                c.description.toLowerCase().includes(s) ||
                c.code.toLowerCase().includes(s)
            );
        }

        if (sortBy === 'Title')
            current.sort((a, b) => a.title.localeCompare(b.title));
        else
            current.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return current;
    }, [courses, searchTerm, sortBy]);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('courses', newCourse, config);
            setCourses(prev => [...prev, data]);
            setIsCreateModalOpen(false);
            setNewCourse({ title: '', code: '', description: '' });
            alert(`Course "${data.title}" added successfully!`);
        } catch (err) {
            alert("Failed to add course: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Delete this course?")) return;
        try {
            await api.delete(`courses/${id}`, config);
            setCourses(courses.filter(c => c._id !== id));
            alert("Course deleted successfully.");
        } catch (err) {
            alert("Failed to delete: " + (err.response?.data?.message || err.message));
        }
    };

    const handleViewCourse = id => navigate(`/dashboard/courses/${id}`);

    if (loading) return <div className="text-center p-10">Loading Courses...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4 w-full md:w-2/3 lg:w-1/2">
                    <div className="relative flex-grow">
                        <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by title or code"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="Latest">Sort by: Latest</option>
                        <option value="Title">Sort by: Title</option>
                    </select>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                >
                    Add Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length ? (
                    filteredCourses.map(c => (
                        <CourseCard
                            key={c._id}
                            course={c}
                            onDelete={handleDeleteCourse}
                            onView={handleViewCourse}
                        />
                    ))
                ) : (
                    <p className="text-gray-500 col-span-3 text-center p-10">
                        {searchTerm ? `No courses found matching "${searchTerm}".` : 'No courses have been added yet.'}
                    </p>
                )}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                title="Add New Course"
                onClose={() => setIsCreateModalOpen(false)}
                footer={
                    <button
                        onClick={handleCreateSubmit}
                        type="submit"
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Save Course
                    </button>
                }
            >
                <form onSubmit={handleCreateSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                        <input
                            type="text"
                            value={newCourse.title}
                            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                            className="w-full min-w-0 border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500 break-words"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Code (e.g., CS101)</label>
                        <input
                            type="text"
                            value={newCourse.code}
                            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                            className="w-full min-w-0 border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500 break-words"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={newCourse.description}
                            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                            rows="3"
                            className="w-full min-w-0 border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500 break-words resize-none"
                        ></textarea>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Courses;
