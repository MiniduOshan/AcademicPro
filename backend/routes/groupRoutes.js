// routes/groupRoutes.js

import express from 'express';
// Assuming you have this middleware in middleware/authMiddleware.js
import protect from '../middleware/authMiddleware.js';
import { 
    createGroup, 
    getGroups, 
    getGroupById, 
    deleteGroup,
    addMember,
    removeMember,
    addDiscussion,
    updateAssignmentStatus,
    updateGroupDetails 
} from '../controllers/groupController.js';

const router = express.Router();

// 1. Group CRUD and Assignment Title/Deadline Edit (PUT handles edits)
// Route: /api/groups
router.route('/')
    .get(protect, getGroups)
    .post(protect, createGroup);

// Route: /api/groups/:id
router.route('/:id')
    .get(protect, getGroupById)
    .delete(protect, deleteGroup)
    .put(protect, updateGroupDetails); // Handles assignmentTitle, deadline, and description updates

// 2. Member Management
// Route: /api/groups/:id/members
router.route('/:id/members')
    .post(protect, addMember) // Add member by ID
    .delete(protect, removeMember); // Remove member by ID

// 3. Discussion
// Route: /api/groups/:id/discuss
router.route('/:id/discuss')
    .post(protect, addDiscussion);

// 4. Project Status Update
// Route: /api/groups/:id/assignment/status
router.route('/:id/assignment/status')
    .put(protect, updateAssignmentStatus);

export default router;