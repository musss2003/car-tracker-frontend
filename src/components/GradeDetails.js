import React from 'react';
import { useParams } from 'react-router-dom';


function GradeDetails() {

    let { subject } = useParams();  // Fetching 'subject' from the route parameter


    const grades = {
        'Math': [{ id: 1, grade: 95, date: '2023-05-01', comments: 'Excellent work on the final exam' }],
        'Science': [{ id: 1, grade: 88, date: '2023-05-02', comments: 'Good job on the lab work' }],
        'History': [{ id: 1, grade: 92, date: '2023-05-03', comments: 'Great understanding of the concepts' }]
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto my-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Math Grades</h2>
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3 px-6">Grade</th>
                            <th scope="col" className="py-3 px-6">Date</th>
                            <th scope="col" className="py-3 px-6">Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grades[subject].map((grade) => (
                            <tr key={grade.id} className="bg-white border-b">
                                <td className="py-4 px-6">{grade.grade}</td>
                                <td className="py-4 px-6">{grade.date}</td>
                                <td className="py-4 px-6">{grade.comments}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GradeDetails;

