import React, { useEffect, useState } from 'react';
import { fetchCourseSchedule, addScheduleSlot, deleteScheduleSlot } from '../api/schedule';
import { getProfileFromStorage } from '../api/auth';

export default function CourseSchedule({ courseId }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const profile = getProfileFromStorage();
  const isTeacher = profile?.role === 'ROLE_TEACHER';

  const [form, setForm] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '10:00',
    endTime: '12:00',
    room: '',
    slotType: 'SEMINAR'
  });

  useEffect(() => {
    loadSlots();
  }, [courseId]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const data = await fetchCourseSchedule(courseId);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.room) {
      alert("Te rog completează sala.");
      return;
    }
    try {
      await addScheduleSlot({ ...form, courseInstanceId: parseInt(courseId) });
      setForm({ ...form, room: '' });
      loadSlots();
    } catch (err) {
      console.error(err);
      alert("Eroare la adăugarea orei.");
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm("Sigur ștergi această oră?")) return;
    try {
      await deleteScheduleSlot(slotId);
      loadSlots();
    } catch (err) {
      console.error(err);
      alert("Eroare la ștergerea orei.");
    }
  };

  if (loading) return <div className="text-center p-4">Se încarcă...</div>;

  const translateDay = (day) => {
    const map = { MONDAY: 'Luni', TUESDAY: 'Marți', WEDNESDAY: 'Miercuri', THURSDAY: 'Joi', FRIDAY: 'Vineri' };
    return map[day] || day;
  };

  const translateType = (type) => {
    const map = { LECTURE: 'Curs', SEMINAR: 'Seminar' };
    return map[type] || type;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Orar Curs</h2>
      
      {slots.length === 0 ? (
        <p className="text-gray-500">Nu a fost adăugată nicio oră la acest curs.</p>
      ) : (
        <div className="grid gap-4">
          {slots.map(slot => (
            <div key={slot.id} className="p-4 border rounded-xl flex items-center justify-between bg-white dark:bg-[#1a2230]">
              <div>
                <p className="font-bold text-lg text-primary">{translateDay(slot.dayOfWeek)}, {slot.startTime} - {slot.endTime}</p>
                <p className="text-sm text-gray-500">Sala: {slot.room} • {translateType(slot.slotType)}</p>
              </div>
              {isTeacher && (
                <button onClick={() => handleDelete(slot.id)} className="text-red-500 hover:text-red-700">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isTeacher && (
        <form onSubmit={handleAdd} className="bg-gray-50 dark:bg-[#121826] p-6 rounded-xl border mt-8 space-y-4">
          <h3 className="font-bold border-b pb-2">Adaugă Oră Nouă (Profesor)</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Ziua</label>
              <select value={form.dayOfWeek} onChange={e => setForm({...form, dayOfWeek: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="MONDAY">Luni</option>
                <option value="TUESDAY">Marți</option>
                <option value="WEDNESDAY">Miercuri</option>
                <option value="THURSDAY">Joi</option>
                <option value="FRIDAY">Vineri</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Tip</label>
              <select value={form.slotType} onChange={e => setForm({...form, slotType: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800">
                <option value="LECTURE">Curs</option>
                <option value="SEMINAR">Seminar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Sala</label>
              <input type="text" value={form.room} onChange={e => setForm({...form, room: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800" placeholder="ex. Amfiteatrul 1" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Ora Început</label>
              <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Ora Sfârșit</label>
              <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800" />
            </div>
          </div>
          <button type="submit" className="w-full mt-4 bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-700">
            Adaugă Oră
          </button>
        </form>
      )}
    </div>
  );
}
