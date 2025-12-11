import { Router } from 'express';
import userController from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

// Public Routes
router.post('/signup', userController.registerUser);
router.post('/login', userController.authUser); 

// FIX: Added public route for user lookup by email (used by invitation modal)
router.get('/lookup', userController.getUserByEmail); // Assumes controller is updated

// Protected Routes
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile); 

export default router;