import React, { useState, useEffect } from 'react';
import { fetchProfile, changePassword } from '../api/auth';

export default function Profil() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const data = await fetchProfile();
      setProfile(data);
    } catch (err) {
      console.error("Eroare la încărcarea profilului:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassMsg({ text: 'Parolele noi nu se potrivesc!', type: 'error' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPassMsg({ text: 'Parola nouă trebuie să aibă minim 6 caractere!', type: 'error' });
      return;
    }

    setSavingPass(true);
    try {
      const res = await changePassword(passwords.currentPassword, passwords.newPassword);
      setPassMsg({ text: res.message || 'Parola a fost schimbată!', type: 'success' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMsg({ text: err.response?.data?.error || 'Eroare la schimbarea parolei.', type: 'error' });
    } finally {
      setSavingPass(false);
    }
  };

  if (loading) return <div className="p-8">Se încarcă profilul...</div>;
  if (!profile) return <div className="p-8 text-red-500">Eroare: Nu am putut găsi profilul.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* HEADER PROFIL */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-bold text-4xl shadow-lg ring-4 ring-primary/20 shrink-0">
          {profile.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{profile.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">{profile.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-bold">
            {profile.role === 'ROLE_STUDENT' ? 'Student' : profile.role === 'ROLE_TEACHER' ? 'Profesor' : 'Administrator'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DETALII SPECIFICE ROLULUI */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <span className="material-symbols-outlined text-primary">badge</span>
            Informații Personale
          </h2>
          
          <div className="space-y-3">
            {profile.role === 'ROLE_STUDENT' && (
              <>
                <InfoRow label="Număr Matricol" value={profile.registrationNumber} />
                <InfoRow label="Serie" value={profile.series} />
                <InfoRow label="Grupa" value={profile.groupName} />
                <InfoRow label="An Înmatriculare" value={profile.enrollmentYear} />
                <InfoRow label="An Studiu Curent" value={profile.studyYear} />
                <InfoRow label="Tip Finanțare" value={profile.fundingType} />
                <InfoRow label="Data Nașterii" value={profile.dateOfBirth} />
              </>
            )}

            {profile.role === 'ROLE_TEACHER' && (
              <>
                <InfoRow label="Grad Academic" value={profile.academicRank} />
                <InfoRow label="Departament" value={profile.department} />
                <InfoRow label="Ore Consultații" value={profile.officeHours} />
              </>
            )}

            {profile.role === 'ROLE_ADMIN' && (
              <p className="text-gray-500 italic">Cont de administrare sistem. Permisiuni complete.</p>
            )}
          </div>
        </div>

        {/* SCHIMBARE PAROLĂ */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2">
            <span className="material-symbols-outlined text-red-500">lock</span>
            Securitate (Schimbare Parolă)
          </h2>

          {passMsg.text && (
            <div className={`p-3 rounded mb-4 text-sm font-bold ${passMsg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {passMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Parola Curentă</label>
              <input 
                type="password" 
                required
                value={passwords.currentPassword}
                onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Parola Nouă</label>
              <input 
                type="password" 
                required
                value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">Confirmare Parolă Nouă</label>
              <input 
                type="password" 
                required
                value={passwords.confirmPassword}
                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button 
              type="submit" 
              disabled={savingPass}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {savingPass ? 'Se salvează...' : 'Actualizează Parola'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-gray-500 dark:text-gray-400">{label}:</span>
      <span className="font-bold text-gray-800 dark:text-gray-200 text-right">{value || '-'}</span>
    </div>
  );
}
