import React, { useState, useEffect } from 'react';
import { getProfileFromStorage, loadAndStoreProfile } from '../api/auth';
import { fetchExploreCatalog, requestCourseAccess, fetchMyRequests } from '../api/courses';

function ExplorareCursuri() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [requestedIds, setRequestedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrowseCatalog();
  }, []);

  const fetchBrowseCatalog = async () => {
    setLoading(true);
    try {
      let profile = getProfileFromStorage();
      if (!profile?.groupName || !profile?.studentId || profile.studentId === 'undefined') {
        profile = await loadAndStoreProfile();
      }
      const grupa = profile?.groupName || '1045';
      const serie = profile?.series || 'A';
      const studentId = profile?.studentId;
      
      const [data, requestsData] = await Promise.all([
        fetchExploreCatalog(grupa, serie, studentId),
        studentId ? fetchMyRequests(studentId) : Promise.resolve([])
      ]);
      
      setAvailableCourses(data);
      setRequestedIds(requestsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (course) => {
    let profile = getProfileFromStorage();
    if (!profile?.studentId) {
      profile = await loadAndStoreProfile();
    }
    if (!profile?.studentId) {
      alert('Profilul de student nu a putut fi încărcat.');
      return;
    }

    const requestPayload = {
      courseInstanceId: course.id,
      courseName: course.name,
      studentId: profile.studentId,
      studentName: profile.name,
      studentGrupa: profile.groupName,
    };

    try {
      await requestCourseAccess(requestPayload);
      alert(`Solicitare trimisă pentru ${course.name}!`);
      setRequestedIds([...requestedIds, course.id]);
    } catch {
      alert('Eroare la trimiterea cererii.');
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
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-2">Catalog Cursuri Opționale / Alte Grupe</h2>
      <p className="text-gray-500 mb-6">
        Solicită accesul profesorilor titulari pentru înscrierea la cursuri opționale.
      </p>

      <div className="grid gap-4">
        {availableCourses.map((course) => {
          const hasRequested = requestedIds.includes(course.id);
          return (
            <div
              key={course.id}
              className="p-5 bg-white dark:bg-[#1a2230] rounded-xl border flex justify-between items-center shadow-sm"
            >
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white">{course.name}</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Profesor: {course.professorName} | Grupa țintă: {course.grupa} (Seria {course.serie})
                </p>
              </div>
              <button
                onClick={() => handleSendRequest(course)}
                disabled={hasRequested}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  hasRequested
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {hasRequested ? 'Solicitat' : 'Solicită Înscriere'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExplorareCursuri;
