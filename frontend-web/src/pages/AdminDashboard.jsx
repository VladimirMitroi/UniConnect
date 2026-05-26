import React, { useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');

  const [userForm, setUserForm] = useState({
    email: '', password: '', role: 'ROLE_STUDENT', 
    firstName: '', lastName: '', 
    dateOfBirth: '', registrationNumber: '', enrollmentYear: new Date().getFullYear(), studyYear: 1, series: '', groupName: '', fundingType: 'BUGET', 
    academicRank: '', department: '', officeHours: ''
  });

  const [courseForm, setCourseForm] = useState({
    name: '', professorId: '', professorName: '', 
    serie: '', grupa: '', semestru: 1, isMandatory: true
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('uniconnect_token');
    try {
      await axios.post('http://localhost:8080/api/admin/users/create', userForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
    const token = localStorage.getItem('uniconnect_token');
    try {
      await axios.post('http://localhost:8080/api/admin/courses/create', courseForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Curs creat și asignat grupei cu succes!');
      setCourseForm({ name: '', professorId: '', professorName: '', serie: '', grupa: '', semestru: 1, isMandatory: true });
    } catch (error) {
      alert("Eroare la crearea cursului.");
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
              <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parolă</label>
              <input type="password" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nume</label>
              <input type="text" required value={userForm.lastName} onChange={e => setUserForm({...userForm, lastName: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prenume</label>
              <input type="text" required value={userForm.firstName} onChange={e => setUserForm({...userForm, firstName: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rol în Platformă</label>
              <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white font-bold text-primary">
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
                <input type="text" placeholder="MAT-123" required value={userForm.registrationNumber} onChange={e => setUserForm({...userForm, registrationNumber: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Nașterii</label>
                <input type="date" required value={userForm.dateOfBirth} onChange={e => setUserForm({...userForm, dateOfBirth: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tip Finanțare</label>
                <select value={userForm.fundingType} onChange={e => setUserForm({...userForm, fundingType: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white">
                  <option value="BUGET">Buget</option>
                  <option value="TAXA">Taxă</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seria</label>
                <input type="text" placeholder="ex: A" value={userForm.series} onChange={e => setUserForm({...userForm, series: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grupa</label>
                <input type="text" placeholder="ex: 1045" value={userForm.groupName} onChange={e => setUserForm({...userForm, groupName: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">An Înmatriculare</label>
                  <input type="number" value={userForm.enrollmentYear} onChange={e => setUserForm({...userForm, enrollmentYear: parseInt(e.target.value)})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">An Studiu</label>
                  <input type="number" min="1" max="4" value={userForm.studyYear} onChange={e => setUserForm({...userForm, studyYear: parseInt(e.target.value)})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
            </div>
          )}

          {userForm.role === 'ROLE_TEACHER' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-dashed mt-4">
               <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grad Academic</label>
                <select value={userForm.academicRank} onChange={e => setUserForm({...userForm, academicRank: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white">
                  <option value="">Alege...</option>
                  <option value="Asistent">Asistent</option>
                  <option value="Lector">Lector</option>
                  <option value="Conferentiar">Conferențiar</option>
                  <option value="Profesor">Profesor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Departament</label>
                <input type="text" placeholder="ex: Cibernetică" value={userForm.department} onChange={e => setUserForm({...userForm, department: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ore Consultații</label>
                <input type="text" placeholder="ex: Luni 14-16" value={userForm.officeHours} onChange={e => setUserForm({...userForm, officeHours: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
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
              <input type="text" placeholder="ex: Cibernetica Sistemelor..." required value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nume Profesor (Vizual)</label>
              <input type="text" required value={courseForm.professorName} onChange={e => setCourseForm({...courseForm, professorName: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Profesor (din DB)</label>
              <input type="number" required value={courseForm.professorId} onChange={e => setCourseForm({...courseForm, professorId: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Semestrul</label>
              <input type="number" min="1" max="2" required value={courseForm.semestru} onChange={e => setCourseForm({...courseForm, semestru: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seria Țintă</label>
                <input type="text" required placeholder="ex: A" value={courseForm.serie} onChange={e => setCourseForm({...courseForm, serie: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Grupa Țintă</label>
                <input type="text" required placeholder="ex: 1045" value={courseForm.grupa} onChange={e => setCourseForm({...courseForm, grupa: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <input type="checkbox" id="mandatory" checked={courseForm.isMandatory} onChange={e => setCourseForm({...courseForm, isMandatory: e.target.checked})} className="w-5 h-5 cursor-pointer" />
              <label htmlFor="mandatory" className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer">Curs Obligatoriu (Studenții din această grupă sunt adăugați automat)</label>
            </div>
          </div>
          
          <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-4">
            Înregistrează Cursul
          </button>
        </form>
      )}
    </div>
  );
}

export default AdminDashboard;