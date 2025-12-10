import Note from '../models/Note.js';

// @desc    Get all notes for the logged-in user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Private
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

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please add a title and content' });
    }

    try {
        const note = await Note.create({
            title,
            content,
            user: req.user._id, // Assign the note to the logged-in user
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    const { title, content } = req.body;

    try {
        const note = await Note.findById(req.params.id);

        if (note && note.user.toString() === req.user._id.toString()) {
            note.title = title || note.title;
            note.content = content || note.content;

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

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
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