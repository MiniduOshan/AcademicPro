import React, { useState, useEffect, useMemo } from 'react';
import { IoSearchOutline, IoChevronDown, IoTrashBinOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal.jsx';

const STATUS_OPTIONS = ['In progress', 'Done']; 

// --- GroupCard Component (FIXED) ---
const GroupCard = ({ group, onViewGroup, onDeleteGroup }) => {
    // Determine if the current user is the admin
    const currentUserId = localStorage.getItem('token') ? JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id : '';
    const isAdmin = group.admin === currentUserId;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    {/* FIX APPLIED: Added break-words to Group Name */}
                    <h3 className="text-lg font-semibold text-gray-800 break-words">{group.name}</h3>
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
                {/* FIX APPLIED: Added break-words to Description */}
                <p className="text-sm text-gray-500 mt-1 break-words">{group.description}</p>
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
                    <button className={`flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors`}>
                        <span>{group.status || 'Active'}</span>
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
    const [searchTerm, setSearchTerm] = useState(''); 
    const [sortBy, setSortBy] = useState('Latest'); 
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
            const { data } = await api.get('groups', config);
            setGroups(data);
        } catch (err) {
            console.error("Failed to fetch groups:", err);
            // Redirect or alert on auth failure
            if (err.response?.status === 401 || err.response?.status === 403) {
                alert("Session expired. Please log in again.");
                localStorage.removeItem('token');
                navigate('/login');
            }
            alert("Failed to load groups: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [token]);
    
    // FIX: Implement the actual filtering and sorting logic
    const filteredGroups = useMemo(() => {
        let currentGroups = [...groups]; // Create a mutable copy for sorting/filtering
        
        // 1. Filtering
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            currentGroups = currentGroups.filter(group => 
                group.name.toLowerCase().includes(lowerCaseSearch) ||
                group.description.toLowerCase().includes(lowerCaseSearch)
            );
        }
        
        // 2. Sorting Logic
        if (sortBy === 'Name') {
            // Sort alphabetically by name
            currentGroups.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'Latest') {
            // Sort by creation date (latest first). Assumes 'createdAt' timestamp exists.
            currentGroups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        // If sorting needs to be by 'Oldest', use a.createdAt - b.createdAt

        return currentGroups;

    }, [groups, searchTerm, sortBy]);


    // --- CREATE GROUP (Retained) ---
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!newGroup.name) return;

        try {
            const { data: createdGroup } = await api.post('groups', newGroup, config);
            
            // Re-fetch to ensure the new group appears correctly with a timestamp, 
            // or manually add and sort (Manual add is faster for UX, but sorting requires a correct timestamp)
            // For now, manual add:
            setGroups(prevGroups => [...prevGroups, createdGroup]); 
            
            setIsCreateModalOpen(false);
            setNewGroup({ name: '', description: '' });

            navigate(`/dashboard/my-groups/${createdGroup._id}`);
            
        } catch (err) {
            alert("Failed to create group: " + (err.response?.data?.message || err.message));
        }
    };

    // --- DELETE GROUP (Retained) ---
    const handleDeleteGroup = async (id) => {
        if (!window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) return;

        try {
            await api.delete(`groups/${id}`, config);
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
                                placeholder="Search groups by name or description"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="Latest">Sort by: Latest</option>
                            <option value="Name">Sort by: Name</option>
                        </select>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                    >
                        Create New Group
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.length > 0 ? (
                        filteredGroups.map((group) => (
                            <GroupCard 
                                key={group._id} 
                                group={group} 
                                onViewGroup={handleViewGroup}
                                onDeleteGroup={handleDeleteGroup}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 col-span-3 text-center p-10 border rounded-lg bg-white">
                            {searchTerm ? `No groups found matching "${searchTerm}".` : 'You are not a member of any groups yet. Create one!'}
                        </p>
                    )}
                </div>
            </div>

            {/* --- CREATE GROUP MODAL (Retained) --- */}
            <Modal 
                isOpen={isCreateModalOpen} 
                title="Create New Group" 
                onClose={() => setIsCreateModalOpen(false)}
                footer={
                    <>
                        <button 
                            onClick={() => setIsCreateModalOpen(false)} 
                            type="button"
                            className="px-4 py-2 text-gray-700 bg-black-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleCreateSubmit} 
                            type="submit"
                            className="px-4 py-2 text-gray-700 bg-black-100 rounded-lg hover:bg-gray-200"
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