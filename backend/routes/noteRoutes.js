import { Router } from 'express';
import noteController from '../controllers/noteController.js';
import protect from '../middleware/authMiddleware.js'; // Import middleware

const router = Router();

// All routes are protected and use the controller logic
router.get('/:id', protect, noteController.getNote);
router.post('/', protect, noteController.createNote);
router.put('/:id', protect, noteController.updateNote);
router.delete('/:id', protect, noteController.deleteNote);
router.get('/', protect, noteController.getNotes); // New route to get all notes

export default router;