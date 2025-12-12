import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend, IoAdd, IoTrashBinOutline, IoPencil } from 'react-icons/io5';
import Modal from '../components/Modal.jsx'; // Assuming Modal is available

// CRITICAL FIX: Use the VITE environment variable for dynamic host switching
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; 
// Added 'To do' back to the list since it's common for status tracking
const STATUS_OPTIONS = ['To do', 'In progress', 'Done']; 


// --- DiscussionCard Component (Added break-words fix) ---
const DiscussionCard = ({ discussion }) => (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-3">
        {/* ... JSX for Discussion Card ... */}
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                {discussion.user?.firstName || 'User'} 
            </span>
            <span className="text-xs text-gray-500">
                {new Date(discussion.createdAt).toLocaleTimeString()}
            </span>
        </div>
        {/* Added break-words to fix overflow bug */}
        <p className="text-gray-700 break-words">{discussion.text}</p>
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
    
    // --- NEW STATES FOR ASSIGNMENT ---
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState({
        assignmentTitle: '',
        deadline: '', // ISO string or empty string
    });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    let currentUserId = '';
    if (token) {
        try {
            currentUserId = JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) { /* ignore */ }
    }
    const isAdmin = group?.admin === currentUserId || group?.admin?._id === currentUserId; 


    const fetchGroup = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/groups/${groupId}`, config);
            setGroup(data);
        } catch (err) {
            console.error("Failed to fetch group details:", err);
            const message = err.response?.data?.message || "Group not found or server unreachable.";
            
            if (err.response?.status === 404 || err.response?.status === 403) {
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
    
    // Helper to format date for input[type="date"]
    const formatDateForInput = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        return date.toISOString().split('T')[0];
    };

    // --- NEW: Open Assignment Modal ---
    const handleOpenAssignmentModal = () => {
        setEditingAssignment({
            assignmentTitle: group?.assignmentTitle || '',
            deadline: formatDateForInput(group?.deadline), // Format existing date
        });
        setIsAssignmentModalOpen(true);
    };

    // --- NEW: Handle Assignment Submit (Add/Edit) ---
    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            assignmentTitle: editingAssignment.assignmentTitle,
            // Deadline is stored as an ISO string
            deadline: editingAssignment.deadline ? new Date(editingAssignment.deadline).toISOString() : null,
        };

        if (!isAdmin) {
            alert("Only the group administrator can set/edit the assignment.");
            return;
        }

        try {
            const updateUrl = `${API_BASE_URL}/api/groups/${groupId}`;
            const { data } = await axios.put(updateUrl, payload, config);
            
            setGroup(prev => ({
                ...prev,
                assignmentTitle: data.assignmentTitle,
                deadline: data.deadline,
            }));

            setIsAssignmentModalOpen(false);
        } catch (err) {
            alert("Failed to update assignment details: " + (err.response?.data?.message || err.message));
        }
    };


    // --- Discussion Logic (Retained) ---
    const handleAddDiscussion = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const { data: newDisc } = await axios.post(`${API_BASE_URL}/api/groups/${groupId}/discuss`, { text: newComment }, config);
            
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

    // --- Handle Member Invitation (Retained) ---
    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberEmail) return;
        setIsInviting(true);

        try {
            const lookupUrl = `${API_BASE_URL}/api/users/lookup?email=${newMemberEmail}`;
            const { data: userLookup } = await axios.get(lookupUrl, config);
            const memberId = userLookup._id;

            await axios.post(`${API_BASE_URL}/api/groups/${groupId}/members`, { memberId }, config);

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
            await axios.delete(`${API_BASE_URL}/api/groups/${groupId}/members`, { 
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
    
    // --- Handle Assignment Status Change (Retained) ---
    const handleUpdateAssignmentStatus = async (e) => {
        const newStatus = e.target.value;
        
        if (!isAdmin) {
             alert("Only the group administrator can change the assignment status.");
             return;
        }

        setGroup(prev => ({ ...prev, projectStatus: newStatus }));

        try {
            const updateUrl = `${API_BASE_URL}/api/groups/${groupId}/assignment/status`;
            
            await axios.put(updateUrl, { assignmentStatus: newStatus }, config);
            
        } catch (err) {
            const message = err.response?.data?.message || err.message;
            alert(`Status update failed: ${message}`);
            fetchGroup(); // Re-fetch to revert the UI state if the API call failed
        }
    };

    // --- Handle Group Deletion (Retained) ---
    const handleDeleteGroup = async () => {
        if (!window.confirm("WARNING: Are you sure you want to delete this group?")) return;
        
        setIsDeleting(true);
        try {
            await axios.delete(`${API_BASE_URL}/api/groups/${groupId}`, config);
            
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

    // Helper to get color class for status dropdown
    const getStatusColor = (status) => {
        if (status === 'Done') return 'bg-green-500 hover:bg-green-600';
        if (status === 'In progress') return 'bg-yellow-500 hover:bg-yellow-600';
        return 'bg-blue-500 hover:bg-blue-600';
    };
    
    // Helper to check if deadline has passed
    const isDeadlinePassed = group.deadline && new Date(group.deadline) < new Date();
    // Helper to display deadline
    const displayDeadline = group.deadline ? new Date(group.deadline).toLocaleDateString() : 'N/A';

    return (
        <div className="grid grid-cols-3 gap-6 h-full">
            {/* LEFT COLUMN: Details & Members */}
            <div className="col-span-1 space-y-6">
                
                {/* Assignment Details (UPDATED) */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold break-words">Group: {group.name || 'Untitled Group'}</h3>
                        <div className="flex space-x-2">
                            {isAdmin && (
                                <button 
                                    onClick={handleOpenAssignmentModal}
                                    title="Edit Assignment"
                                    className="text-gray-400 hover:text-primary-500 p-1 rounded-full"
                                >
                                    <IoPencil className="w-5 h-5" />
                                </button>
                            )}
                            {isAdmin && (
                                <button 
                                    onClick={handleDeleteGroup}
                                    disabled={isDeleting}
                                    title="Delete Group"
                                    className="text-gray-400 hover:text-red-700 disabled:opacity-50"
                                >
                                    <IoTrashBinOutline className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Dynamic Assignment Card */}
                    <div className="border border-gray-200 p-4 rounded-lg">
                        {/* Status Dropdown Interaction */}
                        <select
                            value={group.projectStatus || 'To do'}
                            onChange={handleUpdateAssignmentStatus}
                            disabled={!isAdmin}
                            className={`text-sm font-semibold px-2 py-1 rounded-full text-white ${getStatusColor(group.projectStatus)} cursor-pointer`}
                        >
                            {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status} className="bg-white text-gray-800">{status}</option>
                            ))}
                        </select>
                        
                        <h4 className="font-bold mt-2 break-words">{group.assignmentTitle || 'No Assignment Title Set'}</h4>
                        <p className="text-sm text-gray-500 mb-2 break-words">{group.description || 'No description provided.'}</p>
                        
                        {/* Deadline Display */}
                        <div className="text-xs font-medium mt-3">
                            <span className="text-gray-700">Deadline: </span>
                            <span className={isDeadlinePassed ? 'text-red-500 font-bold' : 'text-primary-500'}>
                                {displayDeadline} {isDeadlinePassed && '(Missed)'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Group Members (Retained) */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Group Members ({group.members.length})</h3>
                        {isAdmin && (
                            <button 
                                onClick={() => setIsMemberModalOpen(true)}
                                className="text-gray-400 hover:text-primary-500 p-1 rounded-full"
                                title="Invite New Member"
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

            {/* RIGHT COLUMN: Discussion Board (Retained) */}
            <div className="col-span-2 flex flex-col space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg flex-grow flex flex-col">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Discussion</h3>
                    
                    {/* Discussion List */}
                    <div className="flex-grow overflow-y-auto space-y-4 pr-3">
                        {group.discussions.length > 0 ? (
                            group.discussions.slice().reverse().map((disc, index) => ( // Reverse order for latest first
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
                        <button 
                            type="submit" 
                            disabled={!currentUserId || !newComment.trim()}
                            className="p-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <IoSend className="w-5 h-5 transform" />
                        </button>
                    </form>
                </div>
            </div>
            
            {/* ADD MEMBER MODAL (Retained) */}
            <Modal 
                isOpen={isMemberModalOpen} 
                title="Invite Member" 
                onClose={() => setIsMemberModalOpen(false)}
                footer={
                    <>
                        <button 
                            onClick={() => setIsMemberModalOpen(false)} 
                            type="button"
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleAddMember} 
                            disabled={isInviting || !newMemberEmail}
                            className="px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:bg-gray-400"
                        >
                            {isInviting ? 'Inviting...' : 'Send Invitation'}
                        </button>
                    </>
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

            {/* NEW: ASSIGNMENT MODAL (Add/Edit Title and Deadline) */}
            <Modal
                isOpen={isAssignmentModalOpen}
                title={group.assignmentTitle ? "Edit Assignment Details" : "Set Group Assignment"}
                onClose={() => setIsAssignmentModalOpen(false)}
                footer={
                    <>
                        <button
                            onClick={() => setIsAssignmentModalOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssignmentSubmit}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Save Details
                        </button>
                    </>
                }
            >
                <form onSubmit={handleAssignmentSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
                        <input
                            type="text"
                            value={editingAssignment.assignmentTitle}
                            onChange={(e) => setEditingAssignment({ ...editingAssignment, assignmentTitle: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="e.g., Final Project: Design System"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
                        <input
                            type="date"
                            value={editingAssignment.deadline}
                            onChange={(e) => setEditingAssignment({ ...editingAssignment, deadline: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <p className="text-xs text-red-500">Note: The project description is currently shared with the Group Description.</p>
                </form>
            </Modal>
        </div>
    );
};

export default GroupDetails;