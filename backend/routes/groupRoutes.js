import { Router } from 'express';
import groupController from '../controllers/groupController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

// Protected Group CRUD Routes
router.route('/')
    .post(protect, groupController.createGroup)
    .get(protect, groupController.getGroups);

router.route('/:id')
    .delete(protect, groupController.deleteGroup);

// Member Management Routes
router.route('/:id/members')
    .post(protect, groupController.addMember)
    .delete(protect, groupController.removeMember);

// Discussion/Comment Routes
router.route('/:id/discuss')
    .post(protect, groupController.addDiscussion);

export default router;