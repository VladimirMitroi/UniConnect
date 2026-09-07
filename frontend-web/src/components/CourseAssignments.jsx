import React, { useState, useEffect } from 'react';
import {
  fetchAssignmentsForCourse,
  createAssignment,
  submitAssignment,
  fetchMySubmission,
  fetchSubmissionsForAssignment,
  gradeSubmission,
  getDownloadUrl,
  autoGradeSubmission,
} from '../api/assignments';
import { getProfileFromStorage } from '../api/auth';
import { cleanFileName } from '../utils/fileUtils';

function CourseAssignments({ courseId }) {
  const profile = getProfileFromStorage();
  const isTeacher = profile?.role === 'ROLE_TEACHER';
  
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const [selectedAssignment, setSelectedAssignment] = useState(null); // id temă curentă ptr upload
  const [file, setFile] = useState(null);
  const [mySubmissions, setMySubmissions] = useState({}); // { assignmentId: submissionObj }

  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState(null); // id temă
  const [submissionsList, setSubmissionsList] = useState([]);
  const [grading, setGrading] = useState({}); // { subId: { grade, feedback } }

  useEffect(() => {
    loadAssignments();
  }, [courseId]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await fetchAssignmentsForCourse(courseId);
      setAssignments(data);

      if (!isTeacher) {
        const subMap = {};
        for (const a of data) {
          try {
            const sub = await fetchMySubmission(a.id);
            if (sub) subMap[a.id] = sub;
          } catch (e) {
          }
        }
        setMySubmissions(subMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await createAssignment({
        title: newTitle,
        description: newDesc,
        deadline: newDeadline,
        courseInstance: { id: courseId }
      });
      setShowCreateForm(false);
      setNewTitle('');
      setNewDesc('');
      setNewDeadline('');
      loadAssignments();
      alert('Tema a fost creată!');
    } catch (err) {
      alert('Eroare la creare temă');
    }
  };

  const handleViewSubmissions = async (assignmentId) => {
    if (viewingSubmissionsFor === assignmentId) {
      setViewingSubmissionsFor(null);
      return;
    }
    setViewingSubmissionsFor(assignmentId);
    try {
      const subs = await fetchSubmissionsForAssignment(assignmentId);
      setSubmissionsList(subs);
      const initGrades = {};
      subs.forEach(s => {
        initGrades[s.id] = { grade: s.grade || '', feedback: s.feedback || '' };
      });
      setGrading(initGrades);
    } catch (err) {
      alert('Eroare la încărcare rezolvări');
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const url = await getDownloadUrl(fileName);
      window.open(url, '_blank');
    } catch (err) {
      alert('Nu s-a putut descărca fișierul');
    }
  };

  const submitGrade = async (subId) => {
    try {
      const g = grading[subId];
      await gradeSubmission(subId, g.grade, g.feedback);
      alert('Nota a fost salvată (și media actualizată automat)!');
    } catch (err) {
      alert('Eroare la notare');
    }
  };

  const handleAutoGrade = async (subId) => {
    try {
      setGrading(prev => ({...prev, [subId]: { ...prev[subId], feedback: 'AI evaluează...' }}));
      const result = await autoGradeSubmission(subId);
      setGrading(prev => ({
        ...prev, 
        [subId]: { 
          grade: result.suggestedGrade || '', 
          feedback: result.feedback || '' 
        }
      }));
    } catch (err) {
      setGrading(prev => ({...prev, [subId]: { ...prev[subId], feedback: 'Eroare la evaluarea AI.' }}));
      alert('Eroare la AI Auto-Grader.');
    }
  };

  const handleStudentSubmit = async (e, assignmentId) => {
    e.preventDefault();
    if (!file) return alert('Selectează un fișier!');
    try {
      await submitAssignment(assignmentId, file);
      alert('Rezolvarea a fost trimisă cu succes!');
      setSelectedAssignment(null);
      setFile(null);
      loadAssignments(); // reîncarcă pentru a bloca formularul
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la trimitere');
    }
  };

  if (loading) return <div>Se încarcă temele...</div>;

  return (
    <div className="space-y-6">
      {isTeacher && (
        <div className="mb-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-bold"
          >
            {showCreateForm ? 'Anulează' : '+ Creează Temă Nouă'}
          </button>
          
          {showCreateForm && (
            <form onSubmit={handleCreateAssignment} className="mt-4 p-4 border rounded-xl bg-gray-50 dark:bg-gray-800 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Titlu Temă</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Cerință / Descriere</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full p-2 border rounded" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Deadline</label>
                <input type="datetime-local" required value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white font-bold rounded">Salvează</button>
            </form>
          )}
        </div>
      )}

      {assignments.length === 0 && !showCreateForm && (
        <div className="text-center p-8 border rounded-xl text-gray-500">
          Nicio temă adăugată încă la acest curs.
        </div>
      )}

      {assignments.map(a => {
        const isPastDeadline = new Date(a.deadline) < new Date();
        const mySub = mySubmissions[a.id];

        return (
          <div key={a.id} className="p-6 border rounded-xl bg-white dark:bg-[#1a2230]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{a.title}</h3>
                <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{a.description}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${isPastDeadline ? 'text-red-500' : 'text-green-500'}`}>
                  Deadline: {new Date(a.deadline).toLocaleString()}
                </p>
              </div>
            </div>

            {/* ZONĂ STUDENT */}
            {!isTeacher && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                {mySub ? (
                  <div>
                    <p className="text-green-600 font-bold mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined">check_circle</span>
                      Ai trimis rezolvarea!
                    </p>
                    <button onClick={() => handleDownload(mySub.fileName)} className="text-primary underline text-sm">
                      Descarcă fișierul trimis ({cleanFileName(mySub.originalFileName)})
                    </button>
                    {mySub.grade !== null ? (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded">
                        <p className="font-bold">Notă: {mySub.grade}</p>
                        {mySub.feedback && <p className="text-sm mt-1">Feedback: {mySub.feedback}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">Așteaptă notarea din partea profesorului.</p>
                    )}
                  </div>
                ) : isPastDeadline ? (
                  <p className="text-red-500 font-bold">Deadline depășit. Nu mai poți încărca rezolvarea.</p>
                ) : (
                  <form onSubmit={(e) => handleStudentSubmit(e, a.id)} className="flex items-center gap-4">
                    <input type="file" onChange={e => setFile(e.target.files[0])} className="text-sm" />
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded font-bold">
                      Trimite Rezolvare
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ZONĂ PROFESOR */}
            {isTeacher && (
              <div className="mt-4">
                <button 
                  onClick={() => handleViewSubmissions(a.id)}
                  className="text-primary font-bold underline"
                >
                  {viewingSubmissionsFor === a.id ? 'Ascunde Rezolvări' : 'Vezi Rezolvări'}
                </button>
                
                {viewingSubmissionsFor === a.id && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="p-3">Student</th>
                          <th className="p-3">Fișier</th>
                          <th className="p-3">Data</th>
                          <th className="p-3">Notă</th>
                          <th className="p-3">Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissionsList.length === 0 ? (
                          <tr><td colSpan="6" className="p-2 text-center text-gray-500">Nicio rezolvare încărcată.</td></tr>
                        ) : (
                          submissionsList.map(s => (
                            <React.Fragment key={s.id}>
                              <tr className="border-t dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20">
                                <td className="p-3 font-bold align-top">{s.student.lastName} {s.student.firstName}</td>
                                <td className="p-3 align-top max-w-[200px] truncate" title={cleanFileName(s.originalFileName)}>
                                  <button onClick={() => handleDownload(s.fileName)} className="text-blue-500 underline text-left">
                                    {cleanFileName(s.originalFileName)}
                                  </button>
                                </td>
                                <td className="p-3 align-top">{new Date(s.submissionDate).toLocaleString()}</td>
                                <td className="p-3 align-top">
                                  <input 
                                    type="number" step="0.01" className="w-20 p-2 border rounded"
                                    value={grading[s.id]?.grade} 
                                    onChange={e => setGrading({...grading, [s.id]: {...grading[s.id], grade: e.target.value}})}
                                  />
                                </td>
                                <td className="p-3 align-top flex items-center gap-2">
                                  <button onClick={() => submitGrade(s.id)} className="px-3 py-1.5 bg-green-500 text-white rounded font-bold text-xs shadow-sm whitespace-nowrap">
                                    Salvează
                                  </button>
                                  <button 
                                    onClick={() => handleAutoGrade(s.id)}
                                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 transition-colors text-white rounded font-bold text-xs flex items-center justify-center gap-1 shadow-sm whitespace-nowrap"
                                    title="Generează notă și feedback cu Inteligența Artificială"
                                  >
                                    <span className="material-symbols-outlined" style={{fontSize: '14px'}}>psychology</span>
                                    Auto-Grade AI
                                  </button>
                                </td>
                              </tr>
                              <tr className="border-b dark:border-gray-700">
                                <td colSpan="5" className="p-3 pt-0 pb-4">
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Feedback Profesor (sau AI)</label>
                                  <textarea 
                                    className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-[#1a2230] text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-y" 
                                    rows={3}
                                    placeholder="Scrie feedback detaliat aici (sau generează cu AI)..."
                                    value={grading[s.id]?.feedback} 
                                    onChange={e => setGrading({...grading, [s.id]: {...grading[s.id], feedback: e.target.value}})}
                                  />
                                </td>
                              </tr>
                            </React.Fragment>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CourseAssignments;
