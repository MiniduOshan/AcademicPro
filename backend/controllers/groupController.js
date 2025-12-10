import Group from '../models/Group.js';
import mongoose from 'mongoose';

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Group name is required' });
    }

    try {
        const groupExists = await Group.findOne({ name });
        if (groupExists) {
            return res.status(400).json({ message: 'A group with this name already exists' });
        }

        const group = await Group.create({
            name,
            description,
            admin: req.user._id,
            members: [req.user._id], // Admin is automatically a member
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all groups where the user is a member
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user._id })
            .populate('admin', 'firstName lastName')
            .populate('members', 'firstName lastName');
        
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private (Admin Only)
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if the logged-in user is the admin
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only the group admin can delete the group' });
        }

        await Group.deleteOne({ _id: req.params.id });
        res.json({ message: 'Group removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Add a member to a group
// @route   POST /api/groups/:id/members
// @access  Private (Admin Only)
const addMember = async (req, res) => {
    const { memberId } = req.body;

    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
        return res.status(400).json({ message: 'Valid memberId is required' });
    }

    try {
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Admin check
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only the group admin can add members' });
        }

        if (group.members.includes(memberId)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        group.members.push(memberId);
        await group.save();
        res.json({ message: 'Member added successfully', group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove a member from a group
// @route   DELETE /api/groups/:id/members
// @access  Private (Admin Only)
const removeMember = async (req, res) => {
    const { memberId } = req.body; 

    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
        return res.status(400).json({ message: 'Valid memberId is required' });
    }

    try {
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Admin check
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only the group admin can remove members' });
        }
        
        // Prevent admin from removing themselves unless they delete the group
        if (group.admin.toString() === memberId) {
             return res.status(400).json({ message: 'Admin cannot remove themselves.' });
        }

        group.members = group.members.filter(
            (member) => member.toString() !== memberId.toString()
        );

        await group.save();
        res.json({ message: 'Member removed successfully', group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a discussion (comment) to a group
// @route   POST /api/groups/:id/discuss
// @access  Private (Members Only)
const addDiscussion = async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Discussion text cannot be empty' });
    }

    try {
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Check if the user is a member of the group
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'You must be a member to discuss' });
        }

        const newDiscussion = {
            text,
            user: req.user._id,
        };

        group.discussions.push(newDiscussion);
        await group.save();

        // Optionally, populate the user info on the newly added comment for immediate display
        const updatedGroup = await Group.findById(req.params.id).populate('discussions.user', 'firstName lastName');

        // Respond with the last added discussion (the new one)
        res.status(201).json(updatedGroup.discussions[updatedGroup.discussions.length - 1]);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export default {
    createGroup,
    getGroups,
    deleteGroup,
    addMember,
    removeMember,
    addDiscussion,
};