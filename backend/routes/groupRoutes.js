import { Router } from 'express';
import groupController from '../controllers/groupController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

// Protected Group CRUD Routes
router.route('/')
    .post(protect, groupController.createGroup)
    .get(protect, groupController.getGroups);

// Single Group Operations
router.route('/:id')
    .get(protect, groupController.getGroup) 
    .delete(protect, groupController.deleteGroup);

// FIX: Added PUT route for changing the group's main assignment status
router.route('/:id/assignment/status')
    .put(protect, groupController.updateAssignmentStatus); // Assumes controller is updated

// Member Management Routes
router.route('/:id/members')
    .post(protect, groupController.addMember)
    .delete(protect, groupController.removeMember);

// Discussion/Comment Routes
router.route('/:id/discuss')
    .post(protect, groupController.addDiscussion);

export default router;