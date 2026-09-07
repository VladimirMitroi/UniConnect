import React, { useState, useEffect } from 'react';
import { fetchGlobalAnnouncements, createGlobalAnnouncement, deleteAnnouncement } from '../api/announcements';
import { getProfileFromStorage } from '../api/auth';

function GlobalAnnouncements() {
  const profile = getProfileFromStorage();
  const isAdmin = profile?.role === 'ROLE_ADMIN';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await fetchGlobalAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createGlobalAnnouncement(newTitle, newContent);
      setNewTitle('');
      setNewContent('');
      loadAnnouncements();
    } catch (err) {
      alert('Eroare la postarea anunțului global.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sigur ștergi acest anunț?")) return;
    try {
      await deleteAnnouncement(id);
      loadAnnouncements();
    } catch (err) {
      alert("Nu s-a putut șterge.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Se încarcă anunțurile...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6 border-b pb-4 dark:border-gray-700">
        <span className="material-symbols-outlined text-4xl text-primary">campaign</span>
        <div>
          <h1 className="text-2xl font-bold">Anunțuri Oficiale</h1>
          <p className="text-sm text-gray-500">Noutăți și informări la nivelul întregii universități</p>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handlePost} className="bg-white dark:bg-[#1a2230] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="font-bold text-lg mb-2">Adaugă Anunț Nou</h3>
          <input 
            type="text" 
            placeholder="Titlu Anunț" 
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            required
          />
          <textarea 
            placeholder="Conținutul anunțului..." 
            className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Se postează...' : 'Postează Anunț'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 dark:bg-[#1a2230] rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500">
            Niciun anunț global momentan.
          </div>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="bg-white dark:bg-[#1a2230] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative group">
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(a.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Șterge Anunț"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
              <h2 className="text-xl font-bold mb-1 text-primary pr-8">{a.title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-medium uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">account_circle</span> {a.authorName}
                <span className="mx-1">•</span>
                <span className="material-symbols-outlined text-[14px]">schedule</span> {new Date(a.postedAt).toLocaleString('ro-RO', { dateStyle: 'long', timeStyle: 'short' })}
              </div>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {a.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GlobalAnnouncements;
