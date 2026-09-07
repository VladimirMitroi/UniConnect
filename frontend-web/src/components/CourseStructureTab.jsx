import React, { useState, useEffect } from 'react';
import { 
  fetchCourseStructure, 
  generateCourseWeeks, 
  toggleSectionVisibility, 
  assignMaterialToSection,
  uploadMaterialToCourse,
  markMaterialComplete,
  fetchCourseProgress,
  generatePracticeTest,
  generatePodcast,
  deleteCourseMaterial
} from '../api/courses';
import { generateFlashcards } from '../api/flashcards';
import { getProfileFromStorage } from '../api/auth';

import { cleanFileName } from '../utils/fileUtils';

function CourseStructureTab({ courseId }) {
  const profile = getProfileFromStorage();
  const isTeacher = profile?.role === 'ROLE_TEACHER';

  const [loading, setLoading] = useState(true);
  const [structure, setStructure] = useState({ generalMaterials: [], sections: [] });
  const [completedMaterials, setCompletedMaterials] = useState([]);
  const [uploadingSection, setUploadingSection] = useState(null); // ID-ul secțiunii (sau 'general') care se uploadează acum

  useEffect(() => {
    loadStructure();
    if (!isTeacher) {
      loadProgress();
    }
  }, [courseId, isTeacher]);

  const loadProgress = async () => {
    try {
      const data = await fetchCourseProgress(courseId);
      setCompletedMaterials(data || []);
    } catch (err) {
      console.error('Eroare la încărcarea progresului:', err);
    }
  };

  const loadStructure = async () => {
    setLoading(true);
    try {
      const data = await fetchCourseStructure(courseId);
      setStructure(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWeeks = async (e) => {
    e.preventDefault();
    try {
      await generateCourseWeeks(courseId);
      alert("Săptămânile au fost generate cu succes folosind calendarul global!");
      loadStructure();
    } catch (err) {
      alert("Eroare la generarea săptămânilor.");
    }
  };

  const handleToggleVisibility = async (sectionId, currentVisibility) => {
    try {
      await toggleSectionVisibility(sectionId, !currentVisibility);
      loadStructure();
    } catch (err) {
      alert("Nu s-a putut schimba vizibilitatea.");
    }
  };

  const handleMoveMaterial = async (materialId, sectionId) => {
    try {
      await assignMaterialToSection(materialId, sectionId || '');
      loadStructure();
    } catch (err) {
      alert("Eroare la mutarea materialului.");
    }
  };

  const handleUploadFile = async (e, sectionId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingSection(sectionId || 'general');
    try {
      await uploadMaterialToCourse(courseId, sectionId, file);
      loadStructure();
    } catch (err) {
      alert("Eroare la încărcarea fișierului.");
    } finally {
      setUploadingSection(null);
      e.target.value = null; // reset input
    }
  };

  const handleMaterialClick = async (materialId) => {
    if (isTeacher) return;
    if (!completedMaterials.includes(materialId)) {
      try {
        await markMaterialComplete(materialId);
        setCompletedMaterials(prev => [...prev, materialId]);
      } catch (err) {
        console.error('Nu s-a putut marca materialul', err);
      }
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Ești sigur că vrei să ștergi acest material?")) return;
    try {
      await deleteCourseMaterial(materialId);
      loadStructure();
    } catch (err) {
      alert("Nu s-a putut șterge materialul.");
      console.error(err);
    }
  };

  const renderMaterialList = (materials) => {
    if (!materials || materials.length === 0) {
      return <p className="text-sm text-gray-400 p-2">Niciun material în această secțiune.</p>;
    }
    return (
      <div className="space-y-2 mt-2">
        {materials.map(m => {
          const isCompleted = completedMaterials.includes(m.id);
          return (
            <div key={m.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#20293a] border rounded-lg">
              <div className="flex items-center gap-3">
                {!isTeacher && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleMaterialClick(m.id)}
                      className="flex-shrink-0 focus:outline-none"
                      title={isCompleted ? "Completat" : "Apasă pentru a marca manual ca citit"}
                    >
                      <span className={`material-symbols-outlined text-2xl transition-colors ${isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-green-400'}`}>
                        {isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                  </div>
                )}
                <span className="material-symbols-outlined text-primary">description</span>
                <div>
                  <p className="font-bold text-sm">{m.title || cleanFileName(m.fileName)}</p>
                  <p className="text-xs text-gray-400 uppercase">{m.materialType || 'FILE'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {m.url ? (
                  m.fileName?.toLowerCase().endsWith('.mp3') ? (
                    <audio controls className="h-10 w-64 md:w-80" src={m.url} onPlay={() => handleMaterialClick(m.id)}>
                      Browserul tău nu suportă elementul audio.
                    </audio>
                  ) : (
                    <a 
                      href={m.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-primary font-bold text-sm"
                      onClick={() => handleMaterialClick(m.id)}
                    >
                      Deschide
                    </a>
                  )
                ) : (
                  <span className="text-xs text-gray-400">{cleanFileName(m.fileName)}</span>
                )}

                {!isTeacher && !m.fileName?.toLowerCase().endsWith('.mp3') && (
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={async () => {
                          const title = prompt("Numește testul tău de antrenament:");
                          if (title) {
                            try {
                              await generatePracticeTest(m.fileName, title, 5, "mix", courseId);
                              alert("Testul se generează! Verifică secțiunea de teste în curând.");
                            } catch (e) {
                              alert("Eroare la generare: " + e.message);
                            }
                          }
                        }}
                        className="px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 shadow transition-colors flex items-center gap-1"
                        title="Generează Test Antrenament"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>psychology</span>
                        Exersează
                      </button>

                      <button
                        onClick={async () => {
                          const title = prompt("Dă un nume setului de flashcards:");
                          if (title) {
                            try {
                              await generateFlashcards(courseId, m.fileName, title);
                              alert("Setul de Flashcards a fost generat! Verifică secțiunea Flashcards.");
                            } catch (e) {
                              alert("Eroare la generare: " + e.message);
                            }
                          }
                        }}
                        className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 shadow transition-colors flex items-center gap-1"
                        title="Generează Flashcards"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>style</span>
                        Flashcards
                      </button>

                      {/* NOU: Generează Podcast */}
                      <button
                        onClick={async () => {
                            try {
                              const sectionId = m.courseSection?.id || null;
                              alert("Se generează podcast-ul. Te rugăm să aștepți (durează câteva secunde).");
                              const res = await generatePodcast(m.fileName, courseId, sectionId);
                              alert("Podcast generat! " + res.message);
                              loadStructure(); // reîncărcăm să vedem noul fișier
                            } catch (e) {
                              alert("Eroare la generare podcast: " + (e.response?.data || e.message));
                            }
                          }}
                          className="px-2 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600 shadow transition-colors flex items-center gap-1"
                          title="Transformă textul în Podcast Audio cu AI"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>podcasts</span>
                          Podcast
                        </button>
                    </div>
                )}
              
              {/* Dropdown pentru mutare materiale (doar pt profesor) */}
              {isTeacher && (
                <div className="flex items-center gap-2">
                  <select 
                    className="text-xs p-1 border rounded"
                    value={m.courseSection ? m.courseSection.id : ''}
                    onChange={(e) => handleMoveMaterial(m.id, e.target.value)}
                  >
                    <option value="">General</option>
                    {structure.sections.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Șterge material"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              )}
            </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <div>Se încarcă structura cursului...</div>;

  const noContent = structure.generalMaterials.length === 0 && structure.sections.length === 0;

  return (
    <div className="space-y-6">
      
      {/* Panou generare saptamani pt profesor daca nu exista sectiuni */}
      {isTeacher && structure.sections.length === 0 && (
        <form onSubmit={handleGenerateWeeks} className="p-4 bg-gray-50 dark:bg-gray-800 border rounded-xl flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold">Structură Lipsă</h3>
            <p className="text-sm text-gray-500">Apasă butonul pentru a genera structura cursului pe săptămâni, conform calendarului academic global.</p>
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-white font-bold rounded">
            Generează Săptămâni
          </button>
        </form>
      )}

      {noContent && !isTeacher && (
         <div className="bg-white dark:bg-[#1a2230] p-8 rounded-xl border text-center text-gray-500">
           Nu există materiale sau secțiuni vizibile pentru acest curs încă.
         </div>
      )}

      {/* Materiale Generale */}
      {(structure.generalMaterials.length > 0 || isTeacher) && (
        <div className="p-4 bg-gray-50 dark:bg-[#1a2230] border rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Materiale Generale</h3>
            {isTeacher && (
              <label className="cursor-pointer text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-[18px]">
                  {uploadingSection === 'general' ? 'sync' : 'upload_file'}
                </span>
                {uploadingSection === 'general' ? 'Se încarcă...' : 'Încarcă fișier'}
                <input type="file" className="hidden" onChange={(e) => handleUploadFile(e, null)} disabled={uploadingSection === 'general'} />
              </label>
            )}
          </div>
          {renderMaterialList(structure.generalMaterials)}
        </div>
      )}

      {/* Secțiunile / Săptămânile */}
      {structure.sections.map(section => (
        <div key={section.id} className={`p-4 border rounded-xl ${section.isVisible ? 'bg-white dark:bg-[#1a2230]' : 'bg-gray-100 dark:bg-gray-800 opacity-75'}`}>
          <div className="flex justify-between items-center mb-2 border-b pb-2">
            <div>
              <h3 className="font-bold text-lg">{section.title}</h3>
              {section.description && <p className="text-sm text-gray-500">{section.description}</p>}
            </div>
            {isTeacher && (
              <div className="flex items-center gap-4">
                <label className="cursor-pointer text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-[18px]">
                    {uploadingSection === section.id ? 'sync' : 'upload_file'}
                  </span>
                  {uploadingSection === section.id ? 'Se încarcă...' : 'Încarcă fișier'}
                  <input type="file" className="hidden" onChange={(e) => handleUploadFile(e, section.id)} disabled={uploadingSection === section.id} />
                </label>

                <button 
                  onClick={() => handleToggleVisibility(section.id, section.isVisible)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary"
                >
                  <span className="material-symbols-outlined">
                    {section.isVisible ? 'visibility' : 'visibility_off'}
                  </span>
                  {section.isVisible ? 'Ascunde' : 'Afișează'}
                </button>
              </div>
            )}
          </div>
          {renderMaterialList(section.materials)}
        </div>
      ))}
    </div>
  );
}

export default CourseStructureTab;
