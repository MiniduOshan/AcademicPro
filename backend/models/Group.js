// models/Group.js

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
        // When using timestamps: true on a subdocument, Mongoose adds createdAt/updatedAt.
        // If you prefer 'createdAt' to be accessible directly on the subdocument:
        // By default, it will be added. 
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
        
        // ===================================
        // === NEW ASSIGNMENT FIELDS START ===
        // ===================================
        assignmentTitle: { // Updated by PUT /api/groups/:id
            type: String,
            default: '',
        },
        deadline: { // Updated by PUT /api/groups/:id
            type: Date,
            default: null,
        },
        projectStatus: { // Updated by PUT /api/groups/:id/assignment/status
            type: String,
            enum: ['To do', 'In progress', 'Done'],
            default: 'To do',
        },
        // ===================================
        // === NEW ASSIGNMENT FIELDS END ===
        // ===================================
        
        // Array of discussion items (comments)
        discussions: [discussionSchema],
    },
    {
        timestamps: true, // Adds createdAt and updatedAt to the main Group document
    }
);

const Group = mongoose.model('Group', GroupSchema);

export default Group;