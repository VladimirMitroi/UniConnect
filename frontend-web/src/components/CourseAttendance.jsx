import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  startAttendanceSession,
  checkInAttendance,
  fetchCourseAttendanceReport,
  getActiveSessionForSection
} from '../api/attendance';
import { getProfileFromStorage } from '../api/auth';
import { fetchCourseStructure } from '../api/courses';

function CourseAttendance({ courseId }) {
  const profile = getProfileFromStorage();
  const isTeacher = profile?.role === 'ROLE_TEACHER';

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSection, setSelectedSection] = useState('');
  const [validityMinutes, setValidityMinutes] = useState(10);
  const [activeSession, setActiveSession] = useState(null);
  const [report, setReport] = useState([]);

  const [pinCode, setPinCode] = useState('');
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [checkInError, setCheckInError] = useState('');

  useEffect(() => {
    loadSections();
    if (isTeacher) {
      loadReport();
    }
  }, [courseId, isTeacher]);

  const loadSections = async () => {
    try {
      const data = await fetchCourseStructure(courseId);
      setSections(data.sections || []);
      if (data.sections && data.sections.length > 0) setSelectedSection(data.sections[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async () => {
    try {
      const data = await fetchCourseAttendanceReport(courseId);
      setReport(data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkActiveSession = async (sectionId) => {
    try {
      const session = await getActiveSessionForSection(sectionId);
      if (session && session.isActive) {
        setActiveSession(session);
      } else {
        setActiveSession(null);
      }
    } catch (e) {
      setActiveSession(null);
    }
  };

  useEffect(() => {
    if (isTeacher && selectedSection) {
      checkActiveSession(selectedSection);
    }
  }, [selectedSection, isTeacher]);

  const handleStartSession = async () => {
    try {
      const data = await startAttendanceSession(courseId, selectedSection, validityMinutes);
      setActiveSession({
        uniqueCode: data.uniqueCode,
        expiresAt: data.expiresAt,
        isActive: true,
        attendeeCount: 0
      });
      loadReport();
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la pornirea sesiunii.');
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setCheckInError('');
    setCheckInSuccess(false);
    try {
      const data = await checkInAttendance(pinCode);
      setCheckInSuccess(true);
      setPinCode('');
      alert(data.message);
    } catch (err) {
      setCheckInError(err.response?.data?.error || 'Cod invalid sau expirat.');
    }
  };

  if (loading) return <div>Se încarcă modulul de prezențe...</div>;

  return (
    <div className="space-y-6">
      {isTeacher ? (
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#1a2230] p-6 rounded-xl border shadow-sm">
            <h3 className="text-xl font-bold mb-4">Lansează Prezențe (Generare QR)</h3>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-500 mb-1">Selectează Săptămâna/Secțiunea</label>
                <select 
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white font-bold"
                  value={selectedSection} 
                  onChange={e => setSelectedSection(e.target.value)}
                >
                  {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">Timp (minute)</label>
                <input 
                  type="number" min="1" max="60" 
                  className="w-32 p-3 border rounded-lg dark:bg-gray-700 dark:text-white font-bold text-center"
                  value={validityMinutes} 
                  onChange={e => setValidityMinutes(Number(e.target.value))}
                />
              </div>
              <button 
                onClick={handleStartSession} 
                disabled={activeSession?.isActive}
                className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {activeSession?.isActive ? 'Sesiune Deja Activă' : 'Start Prezențe'}
              </button>
            </div>

            {activeSession?.isActive && (
              <div className="mt-8 p-8 border-4 border-dashed border-primary rounded-xl flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/10">
                <h4 className="text-2xl font-bold text-center mb-4 text-primary">Prezențe Active</h4>
                <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                  {/* Codul QR conține PIN-ul ca text simplu pentru moment, sau un URL în viitor */}
                  <QRCodeSVG value={activeSession.uniqueCode} size={256} />
                </div>
                <div className="text-center">
                  <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Cod de acces (PIN):</p>
                  <p className="text-5xl font-black tracking-[0.2em] text-[#0d121b] dark:text-white mb-4">
                    {activeSession.uniqueCode}
                  </p>
                  <p className="text-red-500 font-bold animate-pulse">
                    Expiră la: {new Date(activeSession.expiresAt).toLocaleTimeString()}
                  </p>
                  <p className="mt-4 text-lg font-bold text-green-600">
                    <span className="material-symbols-outlined align-middle mr-2">group</span>
                    Studenți înregistrați: {activeSession.attendeeCount || 0}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#1a2230] p-6 rounded-xl border shadow-sm">
            <h3 className="text-xl font-bold mb-4">Istoric Prezențe</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="p-3">Secțiune</th>
                    <th className="p-3 text-center">Cod PIN</th>
                    <th className="p-3">Dată Expirare</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Studenți Prezenți</th>
                  </tr>
                </thead>
                <tbody>
                  {report.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-500">Nicio sesiune de prezențe generată.</td></tr>
                  ) : (
                    report.map(r => (
                      <tr key={r.sessionId} className="border-b dark:border-gray-700">
                        <td className="p-3 font-bold">{r.sectionTitle}</td>
                        <td className="p-3 text-center font-mono font-bold tracking-widest">{r.uniqueCode}</td>
                        <td className="p-3">{new Date(r.expiresAt).toLocaleString()}</td>
                        <td className="p-3 text-center">
                          {r.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">Activ</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">Expirat</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold text-lg">{r.attendeeCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a2230] p-8 rounded-xl border shadow-sm max-w-md mx-auto mt-10">
          <div className="text-center mb-6">
            <span className="material-symbols-outlined text-5xl text-primary mb-2">qr_code_scanner</span>
            <h3 className="text-2xl font-bold">Înregistrează Prezența</h3>
            <p className="text-gray-500 mt-2">Introdu codul PIN de 6 cifre afișat de profesor pe videoproiector.</p>
          </div>

          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Ex: 123456" 
                required 
                maxLength="6"
                className="w-full p-4 border-2 border-dashed rounded-xl text-center text-3xl font-black tracking-[0.3em] dark:bg-gray-800 dark:text-white uppercase focus:border-primary focus:ring-0 transition-colors"
                value={pinCode}
                onChange={e => setPinCode(e.target.value)}
              />
            </div>
            
            {checkInError && (
              <p className="text-red-500 font-bold text-center text-sm bg-red-50 p-2 rounded">{checkInError}</p>
            )}
            {checkInSuccess && (
              <p className="text-green-600 font-bold text-center text-sm bg-green-50 p-2 rounded flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">check_circle</span>
                Prezență salvată cu succes!
              </p>
            )}

            <button 
              type="submit" 
              className="w-full py-4 bg-primary text-white font-bold text-lg rounded-xl shadow-lg hover:bg-primary/90 transition-transform active:scale-95"
            >
              Confirmă Prezența
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CourseAttendance;
