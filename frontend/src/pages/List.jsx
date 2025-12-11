import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoEllipsisHorizontal, IoAdd, IoTrashBinOutline } from 'react-icons/io5';
import Modal from '../components/Modal.jsx'; // Import the new Modal component

const BASE_URL = 'http://localhost:5000'; 
const STATUS_OPTIONS = ['To do', 'In progress', 'Done'];


// --- TaskCard Component (Enhanced) ---
const TaskCard = ({ task, onStatusChange, onDelete }) => {
    
    const getTagColor = (tag) => {
        if (tag === 'DESIGN SYSTEM') return 'bg-green-100 text-green-700';
        if (tag === 'DEVELOPMENT') return 'bg-red-100 text-red-700';
        return 'bg-blue-100 text-blue-700';
    };
    
    // Fallback for avatar initials
    const initials = task.title ? task.title.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

    return (
        <div className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getTagColor(task.tags && task.tags.length > 0 ? task.tags[0] : 'DEFAULT')}`}>
                    {task.tags && task.tags.length > 0 ? task.tags[0] : 'TASK'}
                </span>
                
                {/* Dropdown for Status Change */}
                <select
                    value={task.status || 'To do'}
                    onChange={(e) => onStatusChange(task._id, e.target.value)}
                    className="text-xs font-semibold border border-gray-300 rounded-md bg-white p-1 cursor-pointer focus:ring-primary-500 focus:border-primary-500"
                >
                    {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">{task.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{task.content}</p>
            
            <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                    {/* Placeholder Avatars */}
                    <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                        {initials.slice(0, 2)}
                    </div>
                </div>
                
                {/* Delete Button */}
                <button 
                    onClick={() => onDelete(task._id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                    title="Delete Task"
                >
                    <IoTrashBinOutline className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// --- TaskColumn Component (Enhanced) ---
const TaskColumn = ({ title, tasks, onStatusChange, onOpenModal, onDelete }) => (
    <div className="w-full md:w-1/3 p-2 flex flex-col bg-gray-50 rounded-lg shadow-inner">
        <div className="flex justify-between items-center mb-4 p-2 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{title} ({tasks.length})</h2>
            <div className="flex space-x-2">
                <button 
                    onClick={() => onOpenModal(title)}
                    className="text-gray-400 hover:text-primary-500 p-1 rounded-full hover:bg-gray-200 transition-colors"
                    title={`Add task to ${title}`}
                >
                    <IoAdd className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-primary-500 p-1 rounded-full hover:bg-gray-200 transition-colors">
                    <IoEllipsisHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>
        
        {/* Scrollable Task List */}
        <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {tasks.map((task) => (
                <TaskCard 
                    key={task._id} 
                    task={task} 
                    onStatusChange={onStatusChange} 
                    onDelete={onDelete}
                />
            ))}
        </div>
    </div>
);

// --- List Component (Main Logic) ---
const List = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        status: 'To do', // Default status for new notes
    });

    const token = localStorage.getItem('token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    // --- FETCH NOTES ---
    const fetchNotes = async () => {
        if (!token) {
            setLoading(false);
            setError("Authentication token missing.");
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.get(`${BASE_URL}/api/notes`, config);
            setNotes(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch notes.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);
    
    // --- MODAL HANDLERS ---
    const handleOpenModal = (initialStatus) => {
        setNewNote({ title: '', content: '', status: initialStatus });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleModalChange = (e) => {
        setNewNote({ ...newNote, [e.target.name]: e.target.value });
    };

    // --- ADD NOTE ---
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        
        if (!newNote.title || !newNote.content) {
            alert("Title and content are required.");
            return;
        }

        try {
            const { data: createdNote } = await axios.post(`${BASE_URL}/api/notes`, newNote, config);
            
            setNotes([...notes, createdNote]);
            handleCloseModal();
        } catch (err) {
            alert("Failed to add task: " + (err.response?.data?.message || err.message));
        }
    };

    // --- DELETE NOTE ---
    const handleDeleteNote = async (id) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            await axios.delete(`${BASE_URL}/api/notes/${id}`, config);
            
            // Remove the note from local state
            setNotes(notes.filter(note => note._id !== id));
        } catch (err) {
            alert("Failed to delete task: " + (err.response?.data?.message || err.message));
        }
    };

    // --- CHANGE STATUS (MOVE TASK) ---
    const handleStatusChange = async (id, newStatus) => {
        // Optimistic UI update for immediate visual feedback
        setNotes(notes.map(note => 
            note._id === id ? { ...note, status: newStatus } : note
        ));

        try {
            // Update backend with the new status
            await axios.put(`${BASE_URL}/api/notes/${id}`, { status: newStatus }, config);
            
        } catch (err) {
            alert("Failed to update status. Please reload: " + (err.response?.data?.message || err.message));
            // Revert state if the API call fails
            fetchNotes(); 
        }
    };

    // --- DATA MAPPING ---
    const tasks = {
        'To do': notes.filter(note => note.status === 'To do' || !note.status),
        'In progress': notes.filter(note => note.status === 'In progress'),
        'Done': notes.filter(note => note.status === 'Done'),
    };
    
    if (loading) return <div className="text-center p-10">Loading Tasks...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

    return (
        <>
            <div className="flex h-full space-x-4">
                {STATUS_OPTIONS.map((title) => (
                    <TaskColumn 
                        key={title} 
                        title={title} 
                        tasks={tasks[title] || []} 
                        onStatusChange={handleStatusChange}
                        onOpenModal={handleOpenModal}
                        onDelete={handleDeleteNote}
                    />
                ))}
            </div>

            {/* --- ADD TASK MODAL --- */}
            <Modal 
                isOpen={isModalOpen} 
                title={`Add Task to "${newNote.status}"`} 
                onClose={handleCloseModal}
                footer={
                    <>
                        <button 
                            onClick={handleCloseModal} 
                            type="button"
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleAddSubmit} 
                            type="submit"
                            className="px-4 py-2 text-black bg-primary-500 rounded-lg hover:bg-primary-600"
                        >
                            Create Task
                        </button>
                    </>
                }
            >
                <form onSubmit={handleAddSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={newNote.title}
                            onChange={handleModalChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content/Description</label>
                        <textarea
                            name="content"
                            value={newNote.content}
                            onChange={handleModalChange}
                            rows="4"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={newNote.status}
                            onChange={handleModalChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default List;