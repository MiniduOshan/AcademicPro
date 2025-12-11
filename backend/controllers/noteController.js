import Note from '../models/Note.js';

// @desc    Get all notes for the logged-in user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        // Fetch notes and ensure they have a default status for Kanban grouping
        const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single note by ID (Remains the same)
// @route   GET /api/notes/:id
// @access  Private
const getNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note && note.user.toString() === req.user._id.toString()) {
            res.json(note);
        } else if (note) {
            res.status(401).json({ message: 'Not authorized to view this note' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new note (Updated to accept status)
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    // Destructure status along with title and content
    const { title, content, status } = req.body; 

    if (!title || !content) {
        return res.status(400).json({ message: 'Please add a title and content' });
    }

    try {
        const note = await Note.create({
            title,
            content,
            status: status || 'To do', // Set status, defaulting to 'To do'
            user: req.user._id, // Assign the note to the logged-in user
        });

        res.status(201).json(note);
    } catch (error) {
        // Mongoose validation error might occur if status is not one of the enum values
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a note (Updated to allow status change)
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    // Destructure status along with title and content
    const { title, content, status } = req.body;

    try {
        const note = await Note.findById(req.params.id);

        if (note && note.user.toString() === req.user._id.toString()) {
            // Update fields if they exist in the request body
            note.title = title !== undefined ? title : note.title;
            note.content = content !== undefined ? content : note.content;
            note.status = status !== undefined ? status : note.status;

            const updatedNote = await note.save();
            res.json(updatedNote);
        } else if (note) {
            res.status(401).json({ message: 'Not authorized to update this note' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a note (Remains the same)
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note && note.user.toString() === req.user._id.toString()) {
            await Note.deleteOne({ _id: req.params.id });
            res.json({ message: 'Note removed' });
        } else if (note) {
            res.status(401).json({ message: 'Not authorized to delete this note' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
};