import React from 'react';
import { IoSearchOutline } from 'react-icons/io5';

const courseList = [
    { title: 'Robotics Project', description: 'Advanced control systems and machine vision' },
    { title: 'Robotics Project', description: 'Advanced control systems and machine vision' },
    { title: 'Robotics Project', description: 'Advanced control systems and machine vision' },
    { title: 'Robotics Project', description: 'Advanced control systems and machine vision' },
    { title: 'Robotics Project', description: 'Advanced control systems and machine vision' },
    { title: 'Robotics Project', description: 'Advanced control systems and machine vision' },
];

const CourseCard = ({ course }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600">{course.description}</p>
    </div>
);

const Courses = () => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4 w-full md:w-2/3 lg:w-1/2">
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
                        <option>Sort by: Title</option>
                    </select>
                </div>
                <button className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    Add Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseList.map((course, index) => (
                    <CourseCard key={index} course={course} />
                ))}
            </div>
        </div>
    );
};

export default Courses;