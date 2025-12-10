import mongoose from 'mongoose';

const discussionSchema = mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        // Comment is linked to the user who posted it
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

const GroupSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
        },
        // User who created the group
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Array of all members in the group
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Array of discussion items (comments)
        discussions: [discussionSchema],
    },
    {
        timestamps: true,
    }
);

const Group = mongoose.model('Group', GroupSchema);

export default Group;