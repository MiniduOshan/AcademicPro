import mongoose from 'mongoose';

const CourseSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            // REMOVED: unique: true (This allows updating the title or other fields without triggering a duplicate error)
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true, // KEEP this unique, as course codes should be unique identifiers
        },
        description: {
            type: String,
        },
        // User who added the course (optional)
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Course = mongoose.model('Course', CourseSchema);

export default Course;