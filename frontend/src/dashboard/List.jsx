import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoEllipsisHorizontal, IoAdd, IoTrashBinOutline } from 'react-icons/io5';
import Modal from '../components/Modal.jsx';

const API_BASE_URL = 'http://4.240.89.33:5000' || 'http://localhost:5000';
const STATUS_OPTIONS = ['To do', 'In progress', 'Done'];

// 🎨 CUSTOM COLOR MAPPINGS (ADJUSTED FOR HIGH CONTRAST)
// Accent color (Purple) made darker for better text readability (purple-700 instead of 600)
const ACCENT_COLOR = 'purple-700'; 

/* ---------------------- TASK CARD ---------------------- */
const TaskCard = ({ task, onStatusChange, onDelete }) => {
    const getTagColor = (tag) => {
        // HIGH CONTRAST ADJUSTMENT: Using darker backgrounds (500/600) with white text.
        if (tag === 'DESIGN SYSTEM') return 'bg-teal-600 text-white'; 
        if (tag === 'DEVELOPMENT') return 'bg-rose-600 text-white'; 
        return 'bg-indigo-600 text-white'; 
    };

    const initials = task.title
        ? task.title.split(' ').map(n => n[0]).join('').toUpperCase()
        : '??';

    return (
        <div className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
                
                {/* HIGH CONTRAST: Tag text is now white on a dark colored background */}
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getTagColor(task.tags?.[0] || 'TASK')}`}>
                    {task.tags?.[0] || 'TASK'}
                </span>

                <select
                    value={task.status || 'To do'}
                    onChange={(e) => onStatusChange(task._id, e.target.value)}
                    className="text-xs font-semibold border border-gray-300 rounded-md bg-white p-1 cursor-pointer"
                >
                    {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            <h3 className="font-semibold text-gray-800 mb-2 break-words">{task.title}</h3>
            <p className="text-sm text-gray-500 mb-4 break-words">{task.content}</p>

            <div className="flex justify-between items-center">
                {/* HIGH CONTRAST: Avatar background uses darker ACCENT_COLOR */}
                <div className={`w-6 h-6 rounded-full bg-${ACCENT_COLOR} text-white text-xs font-bold flex items-center justify-center`}>
                    {initials.slice(0, 2)}
                </div>

                <button
                    onClick={() => onDelete(task._id)}
                    className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                    <IoTrashBinOutline className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

/* ---------------------- TASK COLUMN ---------------------- */
const TaskColumn = ({ title, tasks, onStatusChange, onOpenModal, onDelete }) => (
    // Background (bg-gray-50) is light, ensuring high contrast with dark text (text-gray-800)
    <div className="w-full md:w-1/3 p-2 flex flex-col bg-gray-50 rounded-lg shadow-inner">
        
        <div className="flex justify-between items-center mb-4 p-2 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
                {title} ({tasks.length})
            </h2>

            <div className="flex space-x-2">
                {title === 'To do' && (
                    <button
                        onClick={() => onOpenModal(title)}
                        // Hover accent color uses darker ACCENT_COLOR for better visibility
                        className={`text-gray-400 hover:text-${ACCENT_COLOR} p-1 rounded-full hover:bg-gray-200`}
                    >
                        <IoAdd className="w-5 h-5" />
                    </button>
                )}

                <button 
                    // Hover accent color uses darker ACCENT_COLOR for better visibility
                    className={`text-gray-400 hover:text-${ACCENT_COLOR} p-1 rounded-full hover:bg-gray-200`}
                >
                    <IoEllipsisHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            {tasks.map(task => (
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

/* ---------------------- MAIN LIST ---------------------- */
const List = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        status: 'To do',
    });

    const token = localStorage.getItem('token');
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    };

    /* -------- Fetch Notes -------- */
    const fetchNotes = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/notes`, config);
            setNotes(data);
        } catch {
            setError("Failed to fetch notes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotes(); }, []);

    /* -------- Modal Open -------- */
    const handleOpenModal = (status) => {
        setNewNote({ title: '', content: '', status });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    /* -------- Add Note -------- */
    const handleAddSubmit = async (e) => {
        e.preventDefault();

        if (!newNote.title || !newNote.content) {
            alert("Title and content are required.");
            return;
        }

        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/notes`, newNote, config);
            setNotes([...notes, data]);
            handleCloseModal();
        } catch {
            alert("Failed to add task.");
        }
    };

    /* -------- Delete Note -------- */
    const handleDeleteNote = async (id) => {
        if (!window.confirm("Delete this task?")) return;

        await axios.delete(`${API_BASE_URL}/api/notes/${id}`, config);
        setNotes(notes.filter(t => t._id !== id));
    };

    /* -------- Change Status - FIX APPLIED HERE -------- */
    const handleStatusChange = async (id, status) => {
        // Optimistic update for perceived speed
        setNotes(notes.map(t => (t._id === id ? { ...t, status } : t)));

        try {
            // Send update to the server
            const { data: updatedNote } = await axios.put(
                `${API_BASE_URL}/api/notes/${id}`, 
                { status }, 
                config
            );

            // Synchronize state with the server's response. 
            // This is crucial for data persistence across navigation.
            setNotes(prevNotes => 
                prevNotes.map(t => (t._id === id ? updatedNote : t))
            );

        } catch {
            alert("Failed to update status. Reverting changes.");
            // Revert by fetching the database state on failure
            fetchNotes(); 
        }
    };

    /* -------- Group Notes -------- */
    const tasks = {
        'To do': notes.filter(n => n.status === 'To do' || !n.status),
        'In progress': notes.filter(n => n.status === 'In progress'),
        'Done': notes.filter(n => n.status === 'Done'),
    };

    if (loading) return <div className="text-center p-10">Loading Tasks...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <>
            <div className="flex h-full space-x-4">
                {STATUS_OPTIONS.map(title => (
                    <TaskColumn
                        key={title}
                        title={title}
                        tasks={tasks[title]}
                        onStatusChange={handleStatusChange}
                        onOpenModal={handleOpenModal}
                        onDelete={handleDeleteNote}
                    />
                ))}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                title={`Add Task to "${newNote.status}"`}
                onClose={handleCloseModal}
                footer={
                    <>
                        <button
                            onClick={handleCloseModal}
                            className="px-4 py-2 bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>

                        {/* HIGH CONTRAST: Button uses darker ACCENT_COLOR */}
                        <button
                            onClick={handleAddSubmit}
                            className="px-4 py-2 bg-gray-100 rounded-lg"
                        >
                            Create Task
                        </button>
                    </>
                }
            >
                <form onSubmit={handleAddSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            className="w-full border p-2 rounded-lg"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm mb-1">Content</label>
                        <textarea
                            name="content"
                            rows="3"
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            className="w-full border p-2 rounded-lg"
                        />
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default List;