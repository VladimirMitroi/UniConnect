import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfileFromStorage, loadAndStoreProfile } from '../api/auth';
import { fetchStudentEnrollments } from '../api/courses';
import { fetchStudentGradebook } from '../api/gradebook';
import { cleanFileName } from '../utils/fileUtils';

function NoteStudent() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    setLoading(true);
    setError('');
    try {
      let profile = getProfileFromStorage();
      if (!profile?.studentId || profile.studentId === 'undefined') {
        profile = await loadAndStoreProfile();
      }
      if (!profile?.studentId || profile.studentId === 'undefined') {
        setError('Profilul de student nu a putut fi încărcat. Vă rugăm să vă reconectați.');
        return;
      }
      const data = await fetchStudentEnrollments(profile.studentId);
      
      const enrollmentsWithGrades = await Promise.all(data.map(async (e) => {
        try {
          const gb = await fetchStudentGradebook(e.courseInstanceId, profile.studentId);
          return { 
            ...e, 
            realFinalGrade: gb?.student?.finalGrade || null,
            grades: gb?.student?.grades || {},
            items: gb?.items || []
          };
        } catch (err) {
          if (err.response?.data?.finalGrade !== undefined) {
             return { ...e, realFinalGrade: err.response.data.finalGrade, grades: err.response.data.grades || {}, items: [] };
          }
          return { ...e, realFinalGrade: null, grades: {}, items: [] };
        }
      }));
      
      setEnrollments(enrollmentsWithGrades);
    } catch (err) {
      console.error(err);
      setError('Nu am putut încărca situația școlară.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-primary">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0d121b] dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">assignment</span>
          Notele Mele
        </h2>
        <p className="text-[#4c669a] mt-1">Situația academică pe materiile la care ești înscris.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      {enrollments.length === 0 && !error ? (
        <div className="bg-white dark:bg-[#1a2230] p-10 rounded-xl border text-center text-gray-500">
          Nu ai note înregistrate încă.
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a2230] rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-4 font-bold">Materie</th>
                <th className="text-left p-4 font-bold hidden md:table-cell">Profesor</th>
                <th className="text-center p-4 font-bold">Nota Finală</th>
                <th className="text-right p-4 font-bold"></th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr 
                  key={e.id} 
                  className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCourse(e)}
                >
                  <td className="p-4 font-semibold">{e.courseName}</td>
                  <td className="p-4 text-gray-500 hidden md:table-cell">{e.professorName}</td>
                  <td className="p-4 text-center font-bold text-primary text-xl">
                    {e.realFinalGrade != null && e.realFinalGrade > 0 ? Number(e.realFinalGrade).toFixed(2) : '—'}
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-gray-400 text-xs flex items-center justify-end gap-1">
                      Vezi note <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1a2230] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Note: {selectedCourse.courseName}</h3>
              <button 
                onClick={() => setSelectedCourse(null)} 
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              {(!selectedCourse.items || selectedCourse.items.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">block</span>
                  <p>Nu există evaluări (teste sau teme) definite pentru acest curs, sau nu ai nicio notă înregistrată încă.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCourse.items.map((item) => {
                    const gradeKey = `${item.type}_${item.id}`;
                    const gradeValue = selectedCourse.grades[gradeKey] || 0;
                    return (
                      <div key={gradeKey} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">{cleanFileName(item.title)}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{item.type} • Pondere: {item.weight}%</p>
                        </div>
                        <div className="text-2xl font-black text-primary">
                          {gradeValue > 0 ? Number(gradeValue).toFixed(2) : '—'}
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-4 mt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="font-bold text-gray-600 dark:text-gray-400">Media Finală</span>
                    <span className="text-3xl font-black text-green-500">
                      {selectedCourse.realFinalGrade != null && selectedCourse.realFinalGrade > 0 ? Number(selectedCourse.realFinalGrade).toFixed(2) : '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-end">
              <Link 
                to={`/catalog/${selectedCourse.courseInstanceId}`}
                className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
              >
                Mergi la curs <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteStudent;
