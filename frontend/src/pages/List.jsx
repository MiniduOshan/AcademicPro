import { IoEllipsisHorizontal, IoAdd } from 'react-icons/io5';
import React from 'react';

const taskData = {
    'To do': [
        { title: 'Hero section', description: 'Create a design system for a hero section in 2 different variants. Create a simple presentation with these components.', tags: ['DESIGN SYSTEM'], avatars: ['VH', 'AG'] },
        { title: 'Typography change', description: 'Modify typography and styling of text placed on 6 screens of the website design. Prepare a documentation.', tags: ['TYPOGRAPHY'], avatars: ['ML'] },
    ],
    'In progress': [
        { title: 'Implement design screens', description: 'Our designers created 6 screens for a website that needs to be implemented by our dev team.', tags: ['DEVELOPMENT'], avatars: ['VH', 'LK'] },
    ],
    'Done': [
        { title: 'Fix bugs in the CSS code', description: 'Fix small bugs that are essential to prepare for the next release that will happen this quarter.', tags: ['DEVELOPMENT'], avatars: ['HU', 'NL'] },
        { title: 'Proofread final text', description: 'The text provided by marketing department needs to be proofread so that we make sure that it fits into our design.', tags: ['TYPOGRAPHY'], avatars: ['AG'] },
        { title: 'Responsive design', description: 'All designs need to be responsive. The requirement is that it fits all web and mobile screens.', tags: ['DESIGN SYSTEM'], avatars: ['VH', 'AG'] },
    ],
};

const TaskCard = ({ task }) => (
    <div className="bg-white p-4 rounded-xl shadow-md mb-4 border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${task.tags[0] === 'DESIGN SYSTEM' ? 'bg-green-100 text-green-700' : task.tags[0] === 'DEVELOPMENT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {task.tags[0]}
            </span>
            <IoEllipsisHorizontal className="text-gray-400 hover:text-gray-700 cursor-pointer" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">{task.title}</h3>
        <p className="text-sm text-gray-500 mb-4">{task.description}</p>
        <div className="flex space-x-1">
            {task.avatars.map((initials) => (
                <div key={initials} className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                    {initials}
                </div>
            ))}
        </div>
    </div>
);

const TaskColumn = ({ title, tasks }) => (
    <div className="w-full md:w-1/3 p-2 flex flex-col">
        <div className="flex justify-between items-center mb-4 p-2">
            <h2 className="text-lg font-semibold text-gray-800">{title} ({tasks.length})</h2>
            <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-primary-500">
                    <IoAdd className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-primary-500">
                    <IoEllipsisHorizontal className="w-5 h-5" />
                </button>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 180px)' }}> {/* Adjust max height based on header size */}
            {tasks.map((task, index) => (
                <TaskCard key={index} task={task} />
            ))}
        </div>
    </div>
);

const List = () => {
    return (
        <div className="flex h-full space-x-4">
            {Object.entries(taskData).map(([title, tasks]) => (
                <TaskColumn key={title} title={title} tasks={tasks} />
            ))}
        </div>
    );
};

export default List;