// controllers/groupController.js

import asyncHandler from 'express-async-handler';
import Group from '../models/Group.js'; // Requires models/Group.js
import User from '../models/User.js'; // Assumed User model import

// Helper to check if the user is the admin
const checkAdmin = (group, req) => {
    // Handles both populated admin objects and simple IDs
    const adminId = group.admin?._id ? group.admin._id.toString() : group.admin.toString();
    return adminId === req.user._id.toString();
};

/* ---------------------- GROUP CRUD ---------------------- */

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const group = await Group.create({
        name,
        description,
        admin: req.user._id,
        members: [req.user._id], // Admin is automatically a member
    });

    res.status(201).json(group);
});

// @desc    Get all groups the user is a member of
// @route   GET /api/groups
// @access  Private
const getGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find({ members: req.user._id })
        .populate('admin', 'firstName email')
        .sort({ createdAt: -1 });

    res.json(groups);
});

// @desc    Get a group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = asyncHandler(async (req, res) => {
    // Populate members and discussions.user for frontend display
    const group = await Group.findById(req.params.id)
        .populate('admin', 'firstName email')
        .populate('members', 'firstName email')
        .populate('discussions.user', 'firstName email');

    if (group && group.members.map(m => m._id.toString()).includes(req.user._id.toString())) {
        res.json(group);
    } else if (group) {
        res.status(403).json({ message: 'Not authorized to view this group' });
    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private/Admin
const deleteGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);

    if (group) {
        if (!checkAdmin(group, req)) {
            res.status(403).json({ message: 'Only the admin can delete the group' });
            return;
        }

        await Group.deleteOne({ _id: req.params.id });
        res.json({ message: 'Group removed' });
    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});

/* ------------------- ASSIGNMENT & GROUP DETAILS ------------------- */

// @desc    Update group details (assignmentTitle, deadline, description)
// @route   PUT /api/groups/:id
// @access  Private/Admin
const updateGroupDetails = asyncHandler(async (req, res) => {
    const { assignmentTitle, deadline, description } = req.body;
    const group = await Group.findById(req.params.id);

    if (group) {
        if (!checkAdmin(group, req)) {
            res.status(403).json({ message: 'Only the admin can update assignment details' });
            return;
        }

        // Apply updates
        if (assignmentTitle !== undefined) group.assignmentTitle = assignmentTitle;
        if (deadline !== undefined) group.deadline = deadline;
        if (description !== undefined) group.description = description;
        
        const updatedGroup = await group.save();
        res.json({
            _id: updatedGroup._id,
            assignmentTitle: updatedGroup.assignmentTitle,
            deadline: updatedGroup.deadline,
            description: updatedGroup.description,
            // Include other necessary fields for the frontend update
        });

    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});


// @desc    Update assignment status
// @route   PUT /api/groups/:id/assignment/status
// @access  Private/Admin
const updateAssignmentStatus = asyncHandler(async (req, res) => {
    const { assignmentStatus } = req.body;
    const group = await Group.findById(req.params.id);

    if (group) {
        if (!checkAdmin(group, req)) {
            res.status(403).json({ message: 'Only the admin can change the assignment status' });
            return;
        }

        group.projectStatus = assignmentStatus;
        await group.save();

        res.json({ message: 'Status updated', projectStatus: group.projectStatus });
    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});

/* ---------------------- MEMBERS ---------------------- */

// @desc    Add a member to a group
// @route   POST /api/groups/:id/members
// @access  Private/Admin
const addMember = asyncHandler(async (req, res) => {
    const { memberId } = req.body;
    const group = await Group.findById(req.params.id);

    if (group) {
        if (!checkAdmin(group, req)) {
            res.status(403).json({ message: 'Only the admin can add members' });
            return;
        }
        
        if (group.members.map(m => m.toString()).includes(memberId)) {
            res.status(400).json({ message: 'User is already a member' });
            return;
        }

        group.members.push(memberId);
        await group.save();

        const newMember = await User.findById(memberId, 'firstName email');
        res.json(newMember);

    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});

// @desc    Remove a member from a group
// @route   DELETE /api/groups/:id/members
// @access  Private/Admin
const removeMember = asyncHandler(async (req, res) => {
    const { memberId } = req.body;
    const group = await Group.findById(req.params.id);

    if (group) {
        if (!checkAdmin(group, req)) {
            res.status(403).json({ message: 'Only the admin can remove members' });
            return;
        }
        
        if (group.admin.toString() === memberId) {
            res.status(400).json({ message: 'Admin cannot be removed' });
            return;
        }

        group.members = group.members.filter(m => m.toString() !== memberId);
        await group.save();

        res.json({ message: 'Member removed successfully' });
    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});

/* ---------------------- DISCUSSION ---------------------- */

// @desc    Add a discussion post to a group
// @route   POST /api/groups/:id/discuss
// @access  Private
const addDiscussion = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const group = await Group.findById(req.params.id);

    if (group) {
        if (!group.members.map(m => m.toString()).includes(req.user._id.toString())) {
            res.status(403).json({ message: 'You are not a member of this group' });
            return;
        }
        
        const discussion = {
            user: req.user._id,
            text,
        };

        group.discussions.push(discussion);
        await group.save();
        
        // Return the new discussion object (last element)
        res.status(201).json(group.discussions[group.discussions.length - 1]);

    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});


export {
    createGroup, 
    getGroups, 
    getGroupById, 
    deleteGroup,
    updateGroupDetails, 
    updateAssignmentStatus, 
    addMember,
    removeMember,
    addDiscussion,
};