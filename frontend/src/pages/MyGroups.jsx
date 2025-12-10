import { IoSearchOutline, IoChevronDown } from 'react-icons/io5';
import React from 'react';

const groupList = [
    { title: 'Robotics Project', description: 'Advanced control systems and machine vision', members: 3, status: 'in progress', color: 'bg-green-500' },
    { title: 'Academic Chatbot', description: 'Personalized course guidance bot', members: 5, status: 'Done', color: 'bg-green-500' },
    { title: 'Smart Energy Grid', description: 'Campus power usage optimization', members: 3, status: 'in progress', color: 'bg-green-500' },
    { title: 'Student Event Finder App', description: 'Geospatial application for campus activities', members: 2, status: 'Done', color: 'bg-green-500' },
    { title: 'Urban Waste Audit', description: 'Data analysis for campus recycling initiative', members: 5, status: 'Done', color: 'bg-green-500' },
    { title: 'Smart Lab Monitor', description: 'Sensor network for equipment usage', members: 3, status: 'in progress', color: 'bg-green-500' },
];

const GroupCard = ({ group }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between">
        <div>
            <h3 className="text-lg font-semibold text-gray-800">{group.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{group.description}</p>
        </div>
        <div className="mt-4 flex justify-between items-center">
            {/* Avatars Placeholder */}
            <div className="flex -space-x-2">
                {[...Array(group.members)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs text-white z-10">
                        {i === 2 && group.members > 3 ? `+${group.members - 2}` : ''}
                    </div>
                ))}
            </div>

            <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm font-medium rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-50 transition-colors">
                    View Group
                </button>
                <button className={`flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-lg text-white ${group.status === 'in progress' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'} transition-colors`}>
                    <span>{group.status}</span>
                    <IoChevronDown className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

const MyGroups = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4 w-1/2">
                    <div className="relative flex-grow">
                        <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <select className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500">
                        <option>Sort by: Latest</option>
                        <option>Sort by: Name</option>
                    </select>
                </div>
                <button className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    Create New Group
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupList.map((group, index) => (
                    <GroupCard key={index} group={group} />
                ))}
            </div>
        </div>
    );
};

export default MyGroups;