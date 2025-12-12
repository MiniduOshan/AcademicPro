import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from "framer-motion";
import { 
    IoCheckmarkCircleOutline, 
    IoPeopleOutline, 
    IoTimeOutline, 
    IoAlertCircleOutline 
} from 'react-icons/io5';

// API URL (dynamic)
const API_BASE_URL = 'http://academicpro-backend:5000' || 'http://localhost:5000';

// --------------------------------------------------------------------------------------------------
// STAT CARD (Animated)
// --------------------------------------------------------------------------------------------------
const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.03 }}
        // 🎨 COLOR CHANGE: Set card background to always white (bg-white) and remove dark mode classes for the background
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 
                   flex items-center space-x-4"
    >
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>

        <div>
            {/* Kept text color classes for consistency in light mode */}
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-1">{value}</h2>
        </div>
    </motion.div>
);

// --------------------------------------------------------------------------------------------------
// DONUT CHART (Animated)
// --------------------------------------------------------------------------------------------------
const TaskDonutChart = ({ completed, inProgress, total }) => {
    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No tasks available to visualize.
            </div>
        );
    }

    const completedPct = Math.round((completed / total) * 100);
    const inProgressPct = Math.round((inProgress / total) * 100);
    const todoPct = 100 - completedPct - inProgressPct;

    const DONUT_COLOR_DONE = '#ec4899'; // rose-500 (Pink from chart)
    const DONUT_COLOR_IN_PROGRESS = '#2dd4bf'; // teal-400 (Teal from chart)
    const DONUT_COLOR_TODO = '#60a5fa'; // blue-400 (Blue from chart)

    const donutStyle = {
        background: `conic-gradient(
            ${DONUT_COLOR_DONE} 0% ${completedPct}%,
            ${DONUT_COLOR_IN_PROGRESS} ${completedPct}% ${completedPct + inProgressPct}%,
            ${DONUT_COLOR_TODO} ${completedPct + inProgressPct}% 100%
        )`,
    };

    const StatusLegend = ({ color, label, percentage }) => (
        <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-sm text-gray-700">{label} ({percentage}%)</span>
        </div>
    );

    return (
        <div className="flex items-center justify-around h-full">

            {/* Donut animation */}
            <motion.div
                initial={{ scale: 0, rotate: -120 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative w-40 h-40"
            >
                <div className="w-full h-full rounded-full" style={donutStyle}>
                    {/* 🎨 COLOR CHANGE: Set center ring background to always white */}
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white 
                                     rounded-full transform -translate-x-1/2 -translate-y-1/2">
                        <div className="flex flex-col items-center justify-center h-full">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-2xl font-bold text-gray-800">{total}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="space-y-3">
                <StatusLegend color="bg-rose-500" label="Done" percentage={completedPct} />
                <StatusLegend color="bg-teal-400" label="In Progress" percentage={inProgressPct} />
                <StatusLegend color="bg-blue-400" label="To Do" percentage={todoPct} />
            </div>
        </div>
    );
};

// --------------------------------------------------------------------------------------------------
// MAIN DASHBOARD
// --------------------------------------------------------------------------------------------------
const DashboardSummary = () => {
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        totalGroups: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const fetchDashboardData = async () => {
        try {
            const notesResponse = await axios.get(`${API_BASE_URL}/api/notes`, config);
            const notes = notesResponse.data;

            const groupsResponse = await axios.get(`${API_BASE_URL}/api/groups`, config);
            const groups = groupsResponse.data;

            const completed = notes.filter(n => n.status === 'Done').length;
            const inProgress = notes.filter(n => n.status === 'In progress').length;

            setStats({
                totalTasks: notes.length,
                completedTasks: completed,
                inProgressTasks: inProgress,
                totalGroups: groups.length,
            });

        } catch (err) {
            setError(err.response?.data?.message || "Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) return <div className="text-center p-10">Loading Indicators...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            <h1 className="text-3xl font-extrabold text-gray-800">
                Overview Indicators
            </h1>

            {/* KPI CARD GRID - Colors matching the image */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Tasks" value={stats.totalTasks} icon={IoAlertCircleOutline} color="bg-rose-500" /> 
                <StatCard title="Tasks Done" value={stats.completedTasks} icon={IoCheckmarkCircleOutline} color="bg-teal-500" /> 
                <StatCard title="In Progress" value={stats.inProgressTasks} icon={IoTimeOutline} color="bg-indigo-600" /> 
                <StatCard title="Active Groups" value={stats.totalGroups} icon={IoPeopleOutline} color="bg-purple-600" /> 
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* DONUT */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    // 🎨 COLOR CHANGE: Set container background to always white and remove dark mode classes
                    className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg 
                                 border border-gray-200 h-96"
                >
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                        Task Status Distribution
                    </h3>

                    <TaskDonutChart 
                        completed={stats.completedTasks}
                        inProgress={stats.inProgressTasks}
                        total={stats.totalTasks}
                    />
                </motion.div>

                {/* RECENT ACTIVITY */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    // 🎨 COLOR CHANGE: Set container background to always white and remove dark mode classes
                    className="bg-white p-6 rounded-xl shadow-lg border 
                                 border-gray-200 h-96"
                >
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h3>

                    <ul className="text-gray-700 space-y-2">
                        <li>— Task "Hero section" moved to Done.</li>
                        <li>— New member added to Robotics Project.</li>
                        <li>— Note created: Implement design screens.</li>
                    </ul>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DashboardSummary;