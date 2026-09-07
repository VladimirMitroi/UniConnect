import React, { useState, useEffect } from 'react';
import { fetchCourseGradebook, fetchStudentGradebook, updateGradebookWeights } from '../api/gradebook';
import { getProfileFromStorage } from '../api/auth';
import { cleanFileName } from '../utils/fileUtils';

function CourseGradebook({ courseId }) {
  const profile = getProfileFromStorage();
  const isTeacher = profile?.role === 'ROLE_TEACHER';
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [weights, setWeights] = useState({});

  useEffect(() => {
    loadGradebook();
  }, [courseId]);

  const loadGradebook = async () => {
    setLoading(true);
    try {
      if (isTeacher) {
        const result = await fetchCourseGradebook(courseId);
        setData(result);
        
        const w = {};
        result.items.forEach(item => {
          w[`${item.type}_${item.id}`] = item.weight || 0;
        });
        setWeights(w);
      } else {
        const result = await fetchStudentGradebook(courseId, profile?.studentId);
        setData(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (type, id, value) => {
    setWeights({
      ...weights,
      [`${type}_${id}`]: parseInt(value) || 0
    });
  };

  const saveWeights = async () => {
    setIsSaving(true);
    try {
      const payload = { tests: {}, assignments: {} };
      Object.keys(weights).forEach(key => {
        const [type, id] = key.split('_');
        if (type === 'TEST') {
          payload.tests[id] = weights[key];
        } else {
          payload.assignments[id] = weights[key];
        }
      });
      
      await updateGradebookWeights(courseId, payload);
      alert('Ponderile au fost salvate cu succes!');
      loadGradebook();
    } catch (err) {
      alert('Eroare la salvarea ponderilor.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Se încarcă catalogul...</div>;
  }

  if (!data) return null;

  if (isTeacher) {
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">table_chart</span>
            <div>
              <h3 className="font-bold text-lg">Catalog Note (Gradebook)</h3>
              <p className="text-sm text-gray-500">Ponderea totală configurată: <span className={`font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-orange-500'}`}>{totalWeight}%</span></p>
            </div>
          </div>
          <button 
            onClick={saveWeights}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            {isSaving ? 'Se salvează...' : 'Salvează Ponderile'}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-left text-sm bg-white dark:bg-[#1a2230]">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-4 border-b dark:border-gray-700 w-64">Nume Student</th>
                {data.items.map(item => (
                  <th key={`${item.type}_${item.id}`} className="px-4 py-4 border-b dark:border-gray-700 text-center min-w-[120px]">
                    <div className="mb-2 font-bold text-[#0d121b] dark:text-white line-clamp-1" title={item.title}>
                      {cleanFileName(item.title)}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs font-normal">
                      <input 
                        type="number"
                        className="w-16 p-1 border rounded text-center dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-primary"
                        value={weights[`${item.type}_${item.id}`] !== undefined ? weights[`${item.type}_${item.id}`] : item.weight}
                        onChange={(e) => handleWeightChange(item.type, item.id, e.target.value)}
                        min="0" max="100"
                      />
                      <span className="text-gray-400">%</span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-4 border-b dark:border-gray-700 text-center bg-primary/5 text-primary">Nota Finală</th>
              </tr>
            </thead>
            <tbody>
              {data.students.length === 0 ? (
                <tr>
                  <td colSpan={data.items.length + 2} className="px-4 py-8 text-center text-gray-500">
                    Niciun student înscris.
                  </td>
                </tr>
              ) : (
                data.students.map(student => {
                  let sumW = 0;
                  let sumGrades = 0;
                  data.items.forEach(item => {
                    const key = `${item.type}_${item.id}`;
                    const w = weights[key] || 0;
                    const grade = student.grades[key] || 0;
                    if (w > 0) {
                      sumGrades += (grade * w);
                      sumW += w;
                    }
                  });
                  const liveFinal = sumW > 0 ? (sumGrades / sumW).toFixed(2) : '0.00';

                  return (
                    <tr key={student.studentId} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-[#0d121b] dark:text-gray-200">
                        {student.lastName} {student.firstName}
                      </td>
                      {data.items.map(item => {
                        const grade = student.grades[`${item.type}_${item.id}`] || 0;
                        return (
                          <td key={`${item.type}_${item.id}`} className={`px-4 py-3 text-center font-mono ${grade === 0 ? 'text-red-500' : ''}`}>
                            {grade > 0 ? grade.toFixed(2) : '-'}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-bold text-primary bg-primary/5 font-mono">
                        {liveFinal}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const studentData = data.student || data; // Fallback for before refresh
  const finalGrade = studentData.finalGrade || 0;
  const grades = studentData.grades || {};
  const items = data.items || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Nota Finală</h2>
          <p className="text-white/80 text-sm">Calculată pe baza ponderilor stabilite de profesor</p>
        </div>
        <div className="text-5xl font-bold bg-white/20 px-6 py-4 rounded-xl font-mono">
          {finalGrade > 0 ? finalGrade.toFixed(2) : '-'}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2230] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">analytics</span>
          Defalcare Note (Evaluări cu pondere)
        </h3>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nu există încă evaluări definite pentru acest curs.</p>
          ) : (
            items.map(item => {
              const key = `${item.type}_${item.id}`;
              const grade = grades[key] || 0;
              return (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-bold text-gray-700 dark:text-gray-300">{cleanFileName(item.title)}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{item.type} • Pondere: {item.weight}%</p>
                  </div>
                  <span className={`font-bold font-mono text-xl ${grade > 0 ? 'text-primary' : 'text-gray-400'}`}>
                    {grade > 0 ? grade.toFixed(2) : '—'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseGradebook;
