import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProfileFromStorage } from '../api/auth';
import {
  fetchCourse,
  fetchEnrollmentForCourse,
  fetchStudentAvailableTests,
  updateCourseImage
} from '../api/courses';
import CourseAssignments from '../components/CourseAssignments';
import CourseStructureTab from '../components/CourseStructureTab';
import CourseAttendance from '../components/CourseAttendance';
import CourseAnnouncements from '../components/CourseAnnouncements';
import CourseGradebook from '../components/CourseGradebook';
import CourseChatbot from '../components/CourseChatbot';
import CourseFlashcards from '../components/CourseFlashcards';
import CourseQuestionBank from '../components/CourseQuestionBank';
import CourseSchedule from '../components/CourseSchedule';
import CourseStudents from '../components/CourseStudents';

const TABS = [
  { id: 'avizier', label: 'Avizier', icon: 'campaign' },
  { id: 'orar', label: 'Orar Curs', icon: 'event' },
  { id: 'structura', label: 'Structură Curs', icon: 'folder' },
  { id: 'studenti', label: 'Studenți', icon: 'groups', role: 'TEACHER' },
  { id: 'teme', label: 'Teme', icon: 'assignment' },
  { id: 'prezente', label: 'Prezențe (QR)', icon: 'qr_code_scanner' },
  { id: 'evaluari', label: 'Evaluări', icon: 'quiz', role: 'STUDENT' },
  { id: 'banca', label: 'Banca de Întrebări', icon: 'account_balance', role: 'TEACHER' },
  { id: 'note', label: 'Situație Școlară', icon: 'school' },
  { id: 'flashcards', label: 'Flashcards', icon: 'style', role: 'STUDENT' },
  { id: 'ai', label: 'AI Chatbot', icon: 'smart_toy' },
];

import { cleanFileName } from '../utils/fileUtils';

function CourseDetail() {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('avizier');
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [tests, setTests] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  const profile = getProfileFromStorage();
  const isTeacher = profile?.role === 'ROLE_TEACHER';

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const courseData = await fetchCourse(courseId);
      setCourse(courseData);

      if (profile?.role === 'ROLE_STUDENT') {
        try {
          const testsData = await fetchStudentAvailableTests();
          setTests(testsData);
        } catch (err) {
          console.error("Nu s-au putut încărca testele:", err);
          setTests([]);
        }
      } else {
        setTests([]); // Profesorii gestionează testele din dashboard
      }

      if (profile?.studentId) {
        try {
          const enrollmentData = await fetchEnrollmentForCourse(profile.studentId, courseId);
          setEnrollment(enrollmentData);
        } catch {
          setEnrollment(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateImage = async () => {
    const url = window.prompt("Introdu link-ul (URL) imaginii pentru acest curs:", course.imageUrl || "");
    if (url !== null) {
      try {
        await updateCourseImage(courseId, url);
        setCourse({ ...course, imageUrl: url });
        alert("Imagine actualizată cu succes!");
      } catch (err) {
        alert("A apărut o eroare la actualizarea imaginii.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-primary">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Cursul nu a fost găsit.</p>
        <Link to="/catalog" className="text-primary font-bold">
          ← Înapoi la catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Link to="/catalog" className="text-sm text-primary font-bold flex items-center gap-1 mb-4 hover:underline">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Cursurile Mele
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0d121b] dark:text-white">{course.name}</h1>
          <p className="text-[#4c669a] mt-1">
            {course.professorName} · Semestrul {course.semestru}
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={handleUpdateImage}
            className="px-4 py-2 text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">image</span>
            Editează Imagine Curs
          </button>
        )}
      </div>

      <nav className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
        {TABS.map((tab) => {
          return (
            (!tab.role || (tab.role === 'TEACHER' && isTeacher) || (tab.role === 'STUDENT' && !isTeacher)) && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold whitespace-nowrap transition-colors ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            )
          );
        })}
      </nav>

      <div className="bg-white dark:bg-[#1a2230] p-6 rounded-b-xl border border-t-0 shadow-sm min-h-[500px]">
        {activeTab === 'avizier' && (
          <CourseAnnouncements courseId={courseId} />
        )}

        {activeTab === 'orar' && (
          <CourseSchedule courseId={courseId} />
        )}

        {activeTab === 'structura' && (
          <CourseStructureTab courseId={courseId} />
        )}

        {activeTab === 'studenti' && (
          <CourseStudents courseId={courseId} />
        )}

        {activeTab === 'teme' && (
          <CourseAssignments courseId={courseId} />
        )}

        {activeTab === 'prezente' && (
          <CourseAttendance courseId={courseId} />
        )}

        {activeTab === 'evaluari' && (
          <div className="space-y-4">
            {tests.length === 0 ? (
              <div className="bg-white dark:bg-[#1a2230] p-8 rounded-xl border text-center text-gray-500">
                Niciun test disponibil momentan.
              </div>
            ) : (
              tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-[#1a2230] rounded-xl border"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{test.title}</p>
                      {test.testType === 'PRACTICE' && (
                        <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase font-bold tracking-wider">
                          Antrenament
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{cleanFileName(test.courseName)}</p>
                  </div>
                  <Link
                    to={`/test?testId=${test.id}`}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90"
                  >
                    Susține Test
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'banca' && (
          <CourseQuestionBank courseId={courseId} />
        )}

        {activeTab === 'note' && (
          <CourseGradebook courseId={courseId} />
        )}

        {activeTab === 'flashcards' && (
          <CourseFlashcards courseId={courseId} />
        )}

        {activeTab === 'ai' && (
          <CourseChatbot courseId={courseId} />
        )}

      </div>
    </div>
  );
}

export default CourseDetail;
