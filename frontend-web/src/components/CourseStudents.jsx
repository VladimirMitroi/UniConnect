import React, { useEffect, useState } from 'react';
import { fetchCourseStudents } from '../api/courses';

function CourseStudents({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, [courseId]);

  const loadStudents = async () => {
    try {
      const data = await fetchCourseStudents(courseId);
      const sorted = data.sort((a, b) => a.lastName.localeCompare(b.lastName));
      setStudents(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Se încarcă studenții...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold dark:text-white">Studenți Înscriși</h2>
          <p className="text-sm text-gray-500 mt-1">Total studenți cu acces: {students.length}</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-[#1a2230] p-8 rounded-xl border text-center text-gray-500">
          Niciun student înscris la acest curs.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-[#1a2230] border rounded-xl shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b">
                <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Nume Student</th>
                <th className="p-4 font-bold text-gray-600 dark:text-gray-300">Email</th>
                <th className="p-4 font-bold text-gray-600 dark:text-gray-300 text-center">Serie</th>
                <th className="p-4 font-bold text-gray-600 dark:text-gray-300 text-center">Grupă</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 font-medium dark:text-white">
                    {student.lastName} {student.firstName}
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">
                    {student.email}
                  </td>
                  <td className="p-4 text-center dark:text-gray-300">
                    {student.series}
                  </td>
                  <td className="p-4 text-center dark:text-gray-300">
                    {student.groupName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CourseStudents;
