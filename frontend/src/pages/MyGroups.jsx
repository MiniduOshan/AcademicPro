import React, { useState, useEffect } from 'react';
import { IoSearchOutline, IoChevronDown, IoTrashBinOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal.jsx';

const BASE_URL = 'http://localhost:5000'; 
const STATUS_OPTIONS = ['In progress', 'Done']; 

// --- GroupCard Component (Retained) ---
const GroupCard = ({ group, onViewGroup, onDeleteGroup }) => {
    // Determine if the current user is the admin (simplified based on your User model)
    const currentUserId = localStorage.getItem('token') ? JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id : '';
    const isAdmin = group.admin === currentUserId;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                    {isAdmin && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteGroup(group._id); }}
                            className="text-red-400 hover:text-red-600 p-1"
                            title="Delete Group"
                        >
                            <IoTrashBinOutline className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{group.description}</p>
            </div>

            <div className="mt-4 flex justify-between items-center">
                {/* Avatars Placeholder */}
                <div className="flex -space-x-2">
                    {[...Array(group.members.length)].slice(0, 3).map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs text-white z-10">
                             {/* Placeholder Initials */}
                        </div>
                    ))}
                    {group.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-xs text-white z-10">
                            +{group.members.length - 3}
                        </div>
                    )}
                </div>

                <div className="flex space-x-2">
                    <button 
                        onClick={() => onViewGroup(group._id)}
                        className="px-3 py-1 text-sm font-medium rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-50 transition-colors"
                    >
                        View Group
                    </button>
                    {/* Status Placeholder */}
                    <button className={`flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors`}>
                        <span>{group.status || 'Active'}</span>
                        <IoChevronDown className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MyGroups Component (Main Logic) ---
const MyGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    // --- FETCH GROUPS ---
    const fetchGroups = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const { data } = await axios.get(`${BASE_URL}/api/groups`, config);
            setGroups(data);
        } catch (err) {
            console.error("Failed to fetch groups:", err);
            alert("Failed to load groups: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [token]);

    // --- CREATE GROUP FIX ---
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!newGroup.name) return;

        try {
            const { data: createdGroup } = await axios.post(`${BASE_URL}/api/groups`, newGroup, config);
            
            // 1. Update local state
            setGroups([...groups, createdGroup]);
            
            // 2. Close modal
            setIsCreateModalOpen(false);
            setNewGroup({ name: '', description: '' });

            // 3. CRITICAL FIX: Navigate to the newly created group's detail page
            navigate(`/dashboard/my-groups/${createdGroup._id}`);
            
        } catch (err) {
            alert("Failed to create group: " + (err.response?.data?.message || err.message));
        }
    };

    // --- DELETE GROUP (Retained) ---
    const handleDeleteGroup = async (id) => {
        if (!window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) return;

        try {
            await axios.delete(`${BASE_URL}/api/groups/${id}`, config);
            setGroups(groups.filter(group => group._id !== id));
        } catch (err) {
            alert("Failed to delete group: " + (err.response?.data?.message || err.message));
        }
    };
    
    // --- VIEW GROUP (Navigation) (Retained) ---
    const handleViewGroup = (id) => {
        navigate(`/dashboard/my-groups/${id}`);
    };

    if (loading) return <div className="text-center p-10">Loading Groups...</div>;

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex space-x-4 w-1/2">
                        <div className="relative flex-grow">
                            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <select className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                            <option>Sort by: Latest</option>
                            <option>Sort by: Name</option>
                        </select>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors"
                    >
                        Create New Group
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.length > 0 ? (
                        groups.map((group) => (
                            <GroupCard 
                                key={group._id} 
                                group={group} 
                                onViewGroup={handleViewGroup}
                                onDeleteGroup={handleDeleteGroup}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-3 text-center p-10 border rounded-lg bg-white">You are not a member of any groups yet. Create one!</p>
                    )}
                </div>
            </div>

            {/* --- CREATE GROUP MODAL --- */}
            <Modal 
                isOpen={isCreateModalOpen} 
                title="Create New Group" 
                onClose={() => setIsCreateModalOpen(false)}
                footer={
                    <>
                        <button 
                            onClick={() => setIsCreateModalOpen(false)} 
                            type="button"
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleCreateSubmit} 
                            type="submit"
                            className="px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600"
                        >
                            Create Group
                        </button>
                    </>
                }
            >
                <form onSubmit={handleCreateSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                        <input
                            type="text"
                            name="name"
                            value={newGroup.name}
                            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={newGroup.description}
                            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                            rows="3"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                        ></textarea>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default MyGroups;