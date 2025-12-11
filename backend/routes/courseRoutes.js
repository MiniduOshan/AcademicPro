import { Router } from 'express';
import courseController from '../controllers/courseController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

// Routes for listing and adding courses
router.route('/')
    .get(protect, courseController.getCourses)
    .post(protect, courseController.createCourse);

// Routes for specific course operations
router.route('/:id')
    .get(protect, courseController.getCourse) 
    // FIX: Add the PUT method for updating the course
    .put(protect, courseController.updateCourse) // <--- CRITICAL FIX
    .delete(protect, courseController.deleteCourse);

export default router;