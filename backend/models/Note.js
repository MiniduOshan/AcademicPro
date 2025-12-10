import mongoose from 'mongoose';

const NoteSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        // Link the note to the User who created it
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Note = mongoose.model('Note', NoteSchema);

export default Note;