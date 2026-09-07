import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfileFromStorage, loadAndStoreProfile } from '../api/auth';
import { fetchMyCourses } from '../api/courses';
import { fetchProfessorCourses } from '../api/professor';

function Catalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      let profile = getProfileFromStorage();
      if (!profile) {
        profile = await loadAndStoreProfile();
      }

      if (profile?.role === 'ROLE_TEACHER') {
        const data = await fetchProfessorCourses(profile.professorId);
        setCourses(data);
      } else {
        if (!profile?.studentId || profile.studentId === 'undefined') {
          setError('Profilul de student nu a putut fi încărcat. Vă rugăm să vă reconectați.');
          return;
        }
        const data = await fetchMyCourses(
          profile.studentId,
          profile.groupName,
          profile.series
        );
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
      setError('Nu am putut încărca cursurile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-primary">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#0d121b] dark:text-white tracking-tight">
            Cursurile Mele
          </h2>
          <p className="text-[#4c669a] mt-1">
            Acces rapid la cursurile tale.
          </p>
        </div>
        <button
          onClick={loadCourses}
          className="px-4 py-2 text-sm font-bold text-primary border border-primary/30 rounded-lg hover:bg-primary/5"
        >
          Reîncarcă
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">{error}</div>
      )}

      {courses.length === 0 && !error ? (
        <div className="bg-white dark:bg-[#1a2230] p-10 rounded-xl border text-center">
          <p className="text-gray-500">Niciun curs disponibil încă.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col bg-white dark:bg-[#1a2230] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[#e7ebf3] dark:border-[#2d3748]"
            >
              <div 
                className="h-32 flex items-end p-5 bg-cover bg-center relative"
                style={{
                  backgroundImage: course.imageUrl ? `url(${course.imageUrl})` : 'none',
                  backgroundColor: course.imageUrl ? 'transparent' : '' 
                }}
              >
                {!course.imageUrl && <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />}
                <span className="relative z-10 text-xs font-bold uppercase bg-white/90 dark:bg-[#101622]/90 px-2 py-1 rounded shadow-sm">
                  Semestrul {course.semestru}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1 gap-3">
                <h3 className="text-lg font-bold text-[#0d121b] dark:text-white group-hover:text-primary transition-colors">
                  {course.name}
                </h3>
                <p className="text-sm text-[#4c669a]">
                  {course.professorName} · Seria {course.serie}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase w-fit px-2 py-1 rounded ${
                    course.isMandatory
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {course.isMandatory ? 'Obligatoriu' : 'Opțional'}
                </span>
                <Link
                  to={`/catalog/${course.id}`}
                  className="mt-auto w-full py-2.5 bg-primary text-white font-bold rounded-lg text-center hover:bg-primary/90 transition-colors"
                >
                  Accesează Cursul
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalog;
