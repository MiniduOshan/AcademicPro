// server.js (Your provided code - No further changes required)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import groupRoutes from './routes/groupRoutes.js'; // New import
import courseRoutes from './routes/courseRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : undefined;
app.use(cors({ origin: corsOrigins || true }));
app.use(express.json()); // For parsing application/json

// Basic route for testing
app.get('/', (req, res) => {
    res.send('AcademicPro API is running...');
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/groups', groupRoutes); // New Group Route
app.use('/api/courses', courseRoutes);

// Fallback Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});