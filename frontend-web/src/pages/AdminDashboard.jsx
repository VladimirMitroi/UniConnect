import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createUser, createCourse, fetchAllSettings, updateSetting } from '../api/admin';

function AdminDashboard() {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('cursuri')) return 'courses';
    if (location.pathname.includes('sistem')) return 'system';
    return 'users';
  });

  const [settings, setSettings] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('cursuri')) setActiveTab('courses');
    else if (location.pathname.includes('sistem')) setActiveTab('system');
    else setActiveTab('users');
  }, [location.pathname]);

  useEffect(() => {
    if (activeTab === 'system') {
      loadSettings();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const data = await fetchAllSettings();
      data.sort((a, b) => a.key.localeCompare(b.key));
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSettingChange = async (key, newValue) => {
    try {
      await updateSetting(key, newValue);
      loadSettings(); // refresh to show updated
    } catch (err) {
      alert("Eroare la salvarea setării.");
    }
  };

  const [userForm, setUserForm] = useState({
    email: '', password: '', role: 'ROLE_STUDENT',
    firstName: '', lastName: '',
    dateOfBirth: '', registrationNumber: '', enrollmentYear: new Date().getFullYear(), studyYear: 1, series: '', groupName: '', fundingType: 'BUGET',
    academicRank: '', department: '', officeHours: ''
  });

  const [courseForm, setCourseForm] = useState({
    name: '', professorId: '',
    serie: '', grupa: '', semestru: 1, isMandatory: true
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(userForm);
      alert('Utilizator creat cu succes și adăugat în baza de date!');
      setUserForm({
        email: '', password: '', role: 'ROLE_STUDENT', firstName: '', lastName: '',
        dateOfBirth: '', registrationNumber: '', enrollmentYear: new Date().getFullYear(), studyYear: 1, series: '', groupName: '', fundingType: 'BUGET',
        academicRank: '', department: '', officeHours: ''
      });
    } catch (error) {
      alert(error.response?.data?.error || "Eroare la crearea utilizatorului.");
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await createCourse(courseForm);
      alert('Curs creat și asignat grupei cu succes!');
      setCourseForm({ name: '', professorId: '', serie: '', grupa: '', semestru: 1, isMandatory: true });
    } catch (error) {
      alert(error.response?.data?.error || "Eroare la crearea cursului.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-4xl">admin_panel_settings</span>
          Consolă Administrare Sistem
        </h2>
        <p className="text-gray-500 mt-2">Populează baza de date, creează conturi și asignează cursuri.</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`font-bold pb-2 px-4 ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
        >
          Creare Utilizatori
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`font-bold pb-2 px-4 ${activeTab === 'courses' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
        >
          Creare / Asignare Cursuri
        </button>
      </div>

      {activeTab === 'users' && (
        <form onSubmit={handleCreateUser} className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <input type="email" required value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parolă</label>
              <input type="password" required value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nume</label>
              <input type="text" required value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prenume</label>
              <input type="text" required value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol în Platformă</label>
              <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white font-bold text-primary">
                <option value="ROLE_STUDENT">Student</option>
                <option value="ROLE_TEACHER">Profesor</option>
                <option value="ROLE_ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          {userForm.role === 'ROLE_STUDENT' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-dashed mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nr. Matricol</label>
                <input type="text" placeholder="MAT-123" required value={userForm.registrationNumber} onChange={e => setUserForm({ ...userForm, registrationNumber: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Nașterii</label>
                <input type="date" required value={userForm.dateOfBirth} onChange={e => setUserForm({ ...userForm, dateOfBirth: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tip Finanțare</label>
                <select value={userForm.fundingType} onChange={e => setUserForm({ ...userForm, fundingType: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white">
                  <option value="BUGET">Buget</option>
                  <option value="TAXA">Taxă</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seria</label>
                <input type="text" placeholder="ex: A" value={userForm.series} onChange={e => setUserForm({ ...userForm, series: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grupa</label>
                <input type="text" placeholder="ex: 1045" value={userForm.groupName} onChange={e => setUserForm({ ...userForm, groupName: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">An Înmatriculare</label>
                  <input type="number" value={userForm.enrollmentYear} onChange={e => setUserForm({ ...userForm, enrollmentYear: parseInt(e.target.value) })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">An Studiu</label>
                  <input type="number" min="1" max="4" value={userForm.studyYear} onChange={e => setUserForm({ ...userForm, studyYear: parseInt(e.target.value) })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
            </div>
          )}

          {userForm.role === 'ROLE_TEACHER' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-dashed mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grad Academic</label>
                <select value={userForm.academicRank} onChange={e => setUserForm({ ...userForm, academicRank: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white">
                  <option value="">Alege...</option>
                  <option value="Asistent">Asistent</option>
                  <option value="Lector">Lector</option>
                  <option value="Conferentiar">Conferențiar</option>
                  <option value="Profesor">Profesor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Departament</label>
                <input type="text" placeholder="ex: Cibernetică" value={userForm.department} onChange={e => setUserForm({ ...userForm, department: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ore Consultații</label>
                <input type="text" placeholder="ex: Luni 14-16" value={userForm.officeHours} onChange={e => setUserForm({ ...userForm, officeHours: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
          )}

          <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors mt-4">
            Creează Cont și Profil
          </button>
        </form>
      )}

      {activeTab === 'courses' && (
        <form onSubmit={handleCreateCourse} className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nume Materie</label>
              <input type="text" placeholder="ex: Cibernetica Sistemelor..." required value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Profesor (din DB)</label>
              <input type="number" required value={courseForm.professorId} onChange={e => setCourseForm({ ...courseForm, professorId: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Semestrul</label>
                <input type="number" min="1" max="2" required value={courseForm.semestru} onChange={e => setCourseForm({ ...courseForm, semestru: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seria Țintă</label>
                <input type="text" required placeholder="ex: E" value={courseForm.serie} onChange={e => setCourseForm({ ...courseForm, serie: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grupa Țintă (Opțional)</label>
                <input type="text" placeholder="(opțional) ex: 1096" value={courseForm.grupa} onChange={e => setCourseForm({ ...courseForm, grupa: e.target.value })} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <input type="checkbox" id="mandatory" checked={courseForm.isMandatory} onChange={e => setCourseForm({ ...courseForm, isMandatory: e.target.checked })} className="w-5 h-5 cursor-pointer" />
              <label htmlFor="mandatory" className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer">Curs Obligatoriu (Studenții din această grupă sunt adăugați automat)</label>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-4">
            Înregistrează Cursul
          </button>
        </form>
      )}
      {activeTab === 'system' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm space-y-6">
          <h3 className="text-xl font-bold border-b pb-2">Setări Globale Sistem</h3>
          {loadingSettings ? (
            <p className="text-gray-500">Se încarcă setările...</p>
          ) : (
            <div className="space-y-4">
              {settings.map((s) => (
                <div key={s.key} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 dark:text-gray-200">{s.key}</p>
                    <p className="text-sm text-gray-500">{s.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.key === 'enrollment_open' ? (
                      <select
                        value={s.value}
                        onChange={(e) => handleSettingChange(s.key, e.target.value)}
                        className="p-2 border rounded text-sm w-32"
                      >
                        <option value="true">Deschis (True)</option>
                        <option value="false">Închis (False)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={s.value || ''}
                        onChange={(e) => {
                          const updated = [...settings];
                          const index = updated.findIndex(item => item.key === s.key);
                          updated[index].value = e.target.value;
                          setSettings(updated);
                        }}
                        onBlur={(e) => handleSettingChange(s.key, e.target.value)}
                        className="p-2 border rounded text-sm w-64 dark:bg-gray-800 dark:text-white"
                      />
                    )}
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-2">* Setările se salvează automat când părăsești câmpul de text.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;