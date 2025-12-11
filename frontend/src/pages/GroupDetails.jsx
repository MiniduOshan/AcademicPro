import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend, IoAdd, IoTrashBinOutline } from 'react-icons/io5';
import Modal from '../components/Modal.jsx'; 

const BASE_URL = 'http://localhost:5000'; 
const STATUS_OPTIONS = ['To do', 'In progress', 'Done']; 


// --- DiscussionCard Component (Retained) ---
const DiscussionCard = ({ discussion }) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-3">
        {/* ... (JSX for Discussion Card) ... */}
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                {discussion.user?.firstName || 'User'} 
            </span>
            <span className="text-xs text-gray-500">
                {new Date(discussion.createdAt).toLocaleTimeString()}
            </span>
        </div>
        <p className="text-gray-700">{discussion.text}</p>
    </div>
);

// --- MemberAvatar Component (Retained) ---
const MemberAvatar = ({ member, isAdmin, onRemove }) => {
    let currentUserId = '';
    const token = localStorage.getItem('token');
    if (token) {
        try {
            currentUserId = JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) { /* ignore */ }
    }
    
    return (
        <div className="flex flex-col items-center group relative">
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2 border-white shadow">
                <span className="text-xl font-semibold text-gray-700">{member.firstName[0]}</span>
            </div>
            <span className="text-xs text-gray-600 mt-1">{member.firstName}</span>
            
            {isAdmin && member._id !== currentUserId && (
                <button 
                    onClick={() => onRemove(member._id)}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Member"
                >
                    &times;
                </button>
            )}
        </div>
    );
};


const GroupDetails = () => {
    const { groupId } = useParams();
    const navigate = useNavigate(); 
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isInviting, setIsInviting] = useState(false);

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    let currentUserId = '';
    if (token) {
        try {
            currentUserId = JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) { /* ignore */ }
    }
    const isAdmin = group?.admin?._id === currentUserId; 


    const fetchGroup = async () => {
        try {
            const { data } = await axios.get(`${BASE_URL}/api/groups/${groupId}`, config);
            setGroup(data);
        } catch (err) {
            console.error("Failed to fetch group details:", err);
            const message = err.response?.data?.message || "Group not found or server unreachable.";
            
            if (err.response?.status === 404 || err.response?.status === 403) {
                 // Redirect if the group doesn't exist or the user has no access
                 alert(`Error: ${message}. Redirecting to group list.`);
                 navigate('/dashboard/my-groups');
            } else {
                 alert("Error: " + message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroup();
    }, [groupId, token]);

    // --- Discussion Logic (Retained) ---
    const handleAddDiscussion = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const { data: newDisc } = await axios.post(`${BASE_URL}/api/groups/${groupId}/discuss`, { text: newComment }, config);
            
            setGroup(prev => ({
                ...prev,
                discussions: [...prev.discussions, { 
                    ...newDisc, 
                    user: { firstName: 'You', _id: currentUserId }
                }]
            }));
            setNewComment('');

        } catch (err) {
            alert("Failed to post discussion: " + (err.response?.data?.message || err.message));
        }
    };

    // --- FIX 1: Handle Member Invitation (Lookup + Add Member) ---
    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberEmail) return;
        setIsInviting(true);

        try {
            // 1. Look up user by email (Call the new /api/users/lookup endpoint)
            const lookupUrl = `${BASE_URL}/api/users/lookup?email=${newMemberEmail}`;
            const { data: userLookup } = await axios.get(lookupUrl, config);
            const memberId = userLookup._id;

            // 2. Add member using the retrieved ID
            await axios.post(`${BASE_URL}/api/groups/${groupId}/members`, { memberId }, config);

            // 3. Update local state
            setGroup(prev => ({
                ...prev,
                members: [...prev.members, userLookup] 
            }));
            
            alert(`Successfully added ${userLookup.firstName} to the group!`);
            setIsMemberModalOpen(false);
            setNewMemberEmail('');

        } catch (err) {
            const message = err.response?.data?.message || err.message;
            alert(`Invitation Failed: ${message}. Check that the user exists.`);
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        
        if (memberId === currentUserId) {
            alert("You cannot remove yourself if you are the admin. Delete the group instead.");
            return;
        }

        try {
            // Sending DELETE request with body data
            await axios.delete(`${BASE_URL}/api/groups/${groupId}/members`, { 
                ...config, 
                data: { memberId }
            });

            setGroup(prev => ({
                ...prev,
                members: prev.members.filter(m => m._id !== memberId)
            }));
            
        } catch (err) {
            alert("Failed to remove member: " + (err.response?.data?.message || err.message));
        }
    };
    
    // --- FIX 2: Handle Assignment Status Change ---
    const handleUpdateAssignmentStatus = async (e) => {
        const newStatus = e.target.value;
        
        if (!isAdmin) {
             alert("Only the group administrator can change the assignment status.");
             return;
        }

        // Optimistically update the UI status
        setGroup(prev => ({ ...prev, projectStatus: newStatus }));

        try {
            const updateUrl = `${BASE_URL}/api/groups/${groupId}/assignment/status`;
            
            // Send PUT request to the backend with assignmentStatus
            const { data } = await axios.put(updateUrl, { assignmentStatus: newStatus }, config);
            
            // Update local state with the status returned by the server
            setGroup(prev => ({ 
                ...prev, 
                projectStatus: data.projectStatus 
            }));
            
        } catch (err) {
            const message = err.response?.data?.message || err.message;
            alert(`Status update failed: ${message}`);
            fetchGroup(); // Re-fetch to revert the UI state if the API call failed
        }
    };

    // --- FIX 3: Handle Group Deletion ---
    const handleDeleteGroup = async () => {
        if (!window.confirm("WARNING: Are you sure you want to delete this group?")) return;
        
        setIsDeleting(true);
        try {
            // Correct DELETE call
            await axios.delete(`${BASE_URL}/api/groups/${groupId}`, config);
            
            alert("Group deleted successfully.");
            navigate('/dashboard/my-groups'); 
        } catch (err) {
            alert("Failed to delete group: " + (err.response?.data?.message || err.message));
        } finally {
            setIsDeleting(false);
        }
    }


    if (loading) return <div className="text-center p-10">Loading Group...</div>;
    if (!group) return <div className="text-center p-10 text-red-500">Group not found.</div>;

    return (
        <div className="grid grid-cols-3 gap-6 h-full">
            {/* LEFT COLUMN: Details & Members */}
            <div className="col-span-1 space-y-6">
                
                {/* Assignment Details */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Assignment Details: {group.assignmentTitle || 'Project Assignment'}</h3>
                        {isAdmin && (
                            <button 
                                onClick={handleDeleteGroup}
                                disabled={isDeleting}
                                className="text-gray-400 hover:text-red-700 disabled:opacity-50"
                            >
                                <IoTrashBinOutline className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    
                    {/* Placeholder Assignment Card */}
                    <div className="border border-gray-200 p-4 rounded-lg">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                            DESIGN SYSTEM
                        </span>
                        <h4 className="font-bold mt-2">Hero section</h4>
                        <p className="text-sm text-gray-500 mb-4">Create a design system for a hero section in 2 different variants.</p>
                        
                        {/* Status Dropdown */}
                         <select
                            value={group.projectStatus || 'To do'} 
                            onChange={handleUpdateAssignmentStatus}
                            className="text-sm border border-gray-300 rounded-md bg-white p-1 cursor-pointer focus:ring-primary-500 focus:border-primary-500"
                            disabled={!isAdmin || isDeleting} 
                        >
                            {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Group Members */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Group Members ({group.members.length})</h3>
                        {isAdmin && (
                            <button 
                                onClick={() => setIsMemberModalOpen(true)}
                                className="text-gray-400 hover:text-primary-500 p-1 rounded-full"
                            >
                                <IoAdd className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {group.members.map(member => (
                            <MemberAvatar 
                                key={member._id} 
                                member={member} 
                                isAdmin={isAdmin}
                                onRemove={handleRemoveMember}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Discussion Board */}
            <div className="col-span-2 flex flex-col space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg flex-grow flex flex-col">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Discussion</h3>
                    
                    {/* Discussion List */}
                    <div className="flex-grow overflow-y-auto space-y-4 pr-3">
                        {group.discussions.length > 0 ? (
                            group.discussions.map((disc, index) => (
                                <DiscussionCard key={index} discussion={disc} />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center pt-8">No discussions yet. Start a conversation!</p>
                        )}
                    </div>
                    
                    {/* Discussion Input */}
                    <form onSubmit={handleAddDiscussion} className="mt-4 pt-4 border-t border-gray-200 flex items-center space-x-3">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Discuss..."
                            className="flex-grow border border-gray-300 rounded-full py-2 px-4 focus:ring-primary-500 focus:border-primary-500"
                            disabled={!currentUserId}
                        />
                        <button type="submit" className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
                            <IoSend className="w-5 h-5 transform rotate-45" />
                        </button>
                    </form>
                </div>
            </div>
            
            {/* ADD MEMBER MODAL */}
            <Modal 
                isOpen={isMemberModalOpen} 
                title="Invite Member" 
                onClose={() => setIsMemberModalOpen(false)}
                footer={
                    <button 
                        onClick={handleAddMember} 
                        disabled={isInviting || !newMemberEmail}
                        className="px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:bg-gray-400"
                    >
                        {isInviting ? 'Inviting...' : 'Send Invitation'}
                    </button>
                }
            >
                <form onSubmit={handleAddMember}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Email</label>
                    <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="Enter email to invite"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-2">The user must already have an account to be added.</p>
                </form>
            </Modal>
        </div>
    );
};

export default GroupDetails;