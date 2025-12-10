import User from '../models/User.js';
import generateToken from '../config/generateToken.js';

// Helper function to structure user response (used for both signup and login success)
const getUserResponse = (user) => ({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: `${user.firstName} ${user.lastName}`, // The combined name
    email: user.email,
    token: generateToken(user._id),
});

// @desc    Register a new user (Sign Up)
// @route   POST /api/users/signup
// @access  Public
const registerUser = async (req, res) => {
    // Destructure necessary fields from the request body
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // --- DEBUG LINE ---
    console.log(`[AUTH] Attempting signup for email: ${email}`);
    console.log("Received Body:", req.body);
    // ------------------

    // 1. Basic Validation: Check for password mismatch
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // 2. Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Create new user (Password hashing is handled by the Mongoose pre-save hook)
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
        });

        // 4. Respond with user data and JWT token
        if (user) {
            console.log(`[AUTH] User created successfully: ${user.email}`);
            res.status(201).json(getUserResponse(user));
        } else {
            // This usually indicates a Mongoose validation error (e.g., missing required field)
            res.status(400).json({ message: 'Invalid user data (Mongoose validation error)' });
        }
    } catch (error) {
        // Log detailed error from Mongoose/DB
        console.error("[AUTH ERROR] Database or Server Error during signup:", error); 
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find the user by email
        const user = await User.findOne({ email });

        // 2. Check if user exists and password matches (using the method defined in User model)
        if (user && (await user.matchPassword(password))) {
            res.json(getUserResponse(user));
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (Requires JWT via 'protect' middleware)
const getUserProfile = async (req, res) => {
    // req.user is populated by the 'protect' middleware
    const user = req.user; 

    if (user) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: `${user.firstName} ${user.lastName}`,
            email: user.email,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (Requires JWT via 'protect' middleware)
const updateUserProfile = async (req, res) => {
    // Find user by ID attached by the 'protect' middleware
    const user = await User.findById(req.user._id);

    if (user) {
        // Update fields if provided in the request body
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;

        // Handle password change logic
        if (req.body.password) {
            if (req.body.password !== req.body.confirmPassword) {
                 return res.status(400).json({ message: 'New passwords do not match' });
            }
            // Mongoose pre-save hook handles hashing the new password
            user.password = req.body.password; 
        }

        const updatedUser = await user.save();
        
        // Respond with the updated user data and a new JWT (optional, but good practice)
        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            username: `${updatedUser.firstName} ${updatedUser.lastName}`,
            email: updatedUser.email,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export default {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
};