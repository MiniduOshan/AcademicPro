import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoCheckmarkCircleOutline, IoPeopleOutline, IoTimeOutline, IoAlertCircleOutline } from 'react-icons/io5';

const BASE_URL = 'http://localhost:5000'; 

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-4 transition-transform hover:shadow-xl`}>
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-1">{value}</h2>
        </div>
    </div>
);

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
        if (!token) {
            setLoading(false);
            setError("Authentication token missing.");
            return;
        }

        try {
            // Fetch all notes/tasks
            const notesResponse = await axios.get(`${BASE_URL}/api/notes`, config);
            const notes = notesResponse.data;

            // Fetch groups (assuming you have a getGroups endpoint)
            const groupsResponse = await axios.get(`${BASE_URL}/api/groups`, config);
            const groups = groupsResponse.data;

            const completed = notes.filter(n => n.status === 'Done').length;
            const inProgress = notes.filter(n => n.status === 'In progress').length;
            const total = notes.length;

            setStats({
                totalTasks: total,
                completedTasks: completed,
                inProgressTasks: inProgress,
                totalGroups: groups.length,
            });
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load dashboard data.");
            console.error(err);
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
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold text-gray-800">Overview Indicators</h1>
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Tasks" 
                    value={stats.totalTasks} 
                    icon={IoAlertCircleOutline} 
                    color="bg-primary-500"
                />
                <StatCard 
                    title="Tasks Done" 
                    value={stats.completedTasks} 
                    icon={IoCheckmarkCircleOutline} 
                    color="bg-green-500"
                />
                <StatCard 
                    title="In Progress" 
                    value={stats.inProgressTasks} 
                    icon={IoTimeOutline} 
                    color="bg-yellow-500"
                />
                <StatCard 
                    title="Active Groups" 
                    value={stats.totalGroups} 
                    icon={IoPeopleOutline} 
                    color="bg-indigo-500"
                />
            </div>

            {/* Placeholder for charts/recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-96">
                    <h3 className="text-xl font-semibold mb-4">Task Completion Rate</h3>
                    <p className="text-gray-500">
                        [Placeholder for a Chart or Graph]
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-96">
                    <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                    <ul className="text-gray-600 space-y-2">
                        <li>— Task "Hero section" moved to Done.</li>
                        <li>— New member added to Robotics Project.</li>
                        <li>— Note created: Implement design screens.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;