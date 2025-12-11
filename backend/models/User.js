// --- In backend/models/User.js (FINAL FIX) ---
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/.+@.+\..+/, 'Must match an email address!'],
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        mobileNumber: {
            type: String,
            default: '',
        },
        // FIELD FOR PROFILE PICTURE URL
        profilePic: {
            type: String,
            // Use a relative path or the full URL to a default image storage service
            default: '/images/default_avatar.png', 
        },
        // Location removed from the frontend fields, but kept neutral in the model
        location: { 
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// ... (matchPassword and pre-save middleware remain the same) ...

const User = mongoose.model('User', UserSchema);

export default User;