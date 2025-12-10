import { Router } from 'express';
import userController from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js'; // Import middleware

const router = Router();

// Public Routes
router.post('/signup', userController.registerUser); // Replaces createuser
router.post('/login', userController.authUser);     // New login route

// Protected Routes
router.get('/profile', protect, userController.getUserProfile); // Get own profile
router.put('/profile', protect, userController.updateUserProfile); // Update own profile

export default router;