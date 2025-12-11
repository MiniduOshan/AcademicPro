import Course from '../models/Course.js';
import mongoose from 'mongoose';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private 
const getCourses = async (req, res) => {
    try {
        // Fetch all courses, newest first
        const courses = await Course.find({}).sort({ createdAt: -1 }); 
        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private
const getCourse = async (req, res) => {
    try {
        // Populate 'addedBy' field to show the user's name on the frontend details page
        const course = await Course.findById(req.params.id).populate('addedBy', 'firstName lastName _id');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        // Handle invalid MongoDB ID format
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid course ID format.' });
        }
        console.error("Error fetching course:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private
const createCourse = async (req, res) => {
    const { title, code, description } = req.body;

    if (!title || !code) {
        return res.status(400).json({ message: 'Course title and code are required' });
    }

    try {
        const courseExists = await Course.findOne({ code });
        if (courseExists) {
            return res.status(400).json({ message: 'A course with this code already exists' });
        }

        const course = await Course.create({
            title,
            code,
            description,
            addedBy: req.user._id, // Assign the course to the logged-in user
        });

        // Populate the 'addedBy' field before sending the response
        await course.populate('addedBy', 'firstName lastName');

        res.status(201).json(course);
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an existing course (NEWLY ADDED FUNCTION)
// @route   PUT /api/courses/:id
// @access  Private (Only the user who added it can edit)
const updateCourse = async (req, res) => {
    const { title, code, description } = req.body;

    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Authorization Check: Must be the original creator
        if (course.addedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to edit this course' });
        }
        
        // Update fields if provided in the request body
        course.title = title || course.title;
        course.code = code || course.code;
        course.description = description !== undefined ? description : course.description;

        const updatedCourse = await course.save();

        // Populate the 'addedBy' field again before sending the response
        await updatedCourse.populate('addedBy', 'firstName lastName _id');

        res.json(updatedCourse);
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Only the user who added it can delete)
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Authorization Check: Check if the logged-in user is the one who added the course
        if (course.addedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this course' });
        }

        await Course.deleteOne({ _id: req.params.id });
        res.json({ message: 'Course removed successfully' });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: error.message });
    }
};

export default {
    getCourses,
    getCourse,
    createCourse,
    updateCourse, // <-- Added
    deleteCourse,
};