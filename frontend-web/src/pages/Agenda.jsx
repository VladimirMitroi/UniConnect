import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO, isToday } from 'date-fns';
import { ro } from 'date-fns/locale';
import { fetchStudentCalendar, fetchTeacherCalendar } from '../api/calendar';
import { getProfileFromStorage, loadAndStoreProfile } from '../api/auth';

function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      let profile = getProfileFromStorage();
      if (!profile) profile = await loadAndStoreProfile();

      if (profile?.role === 'ROLE_STUDENT' && profile?.studentId) {
        const data = await fetchStudentCalendar(profile.studentId);
        setEvents(data);
      } else if (profile?.role === 'ROLE_TEACHER' && profile?.professorId) {
        const data = await fetchTeacherCalendar(profile.professorId);
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const dayEvents = events.filter(e => {
        if (!e.date) return false;
        return isSameDay(parseISO(e.date), cloneDay);
      });

      const isCurrentMonth = isSameMonth(day, monthStart);
      const isSelected = isSameDay(day, selectedDate);
      const isDayToday = isToday(day);

      days.push(
        <div
          className={`min-h-[100px] border border-gray-100 dark:border-gray-800 p-2 transition-all cursor-pointer relative group
            ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/30 text-gray-400' : 'bg-white dark:bg-[#1a2230]'}
            ${isSelected ? 'ring-2 ring-primary ring-inset bg-primary/5 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
          `}
          key={day}
          onClick={() => setSelectedDate(cloneDay)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
              ${isDayToday ? 'bg-primary text-white' : ''}
              ${!isCurrentMonth && !isDayToday ? 'text-gray-400' : ''}
            `}>
              {formattedDate}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-xs font-bold text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                {dayEvents.length}
              </span>
            )}
          </div>
          
          <div className="mt-2 space-y-1">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div 
                key={`${event.id}-${idx}`} 
                className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium
                  ${event.type === 'TEST' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}
                `}
                title={event.title}
              >
                {event.type === 'TEST' ? '📝' : '📎'} {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-[10px] text-gray-500 font-medium pl-1">
                + {dayEvents.length - 3} altele
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day}>
        {days}
      </div>
    );
    days = [];
  }

  const selectedDateEvents = events.filter(e => e.date && isSameDay(parseISO(e.date), selectedDate));

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#0d121b] dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">calendar_month</span>
          Agendă & Deadline-uri
        </h2>
        <p className="text-[#4c669a] mt-1">Gestionează-ți timpul eficient. Aici găsești toate termenele limită pentru teme și teste.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Calendar Grid */}
        <div className="flex-1 bg-white dark:bg-[#1a2230] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: ro })}
              </h3>
              <button onClick={goToToday} className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md font-medium transition-colors">
                Azi
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          
          {/* Days of week */}
          <div className="grid grid-cols-7 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            {['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'].map(d => (
              <div key={d} className="p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          
          {/* Calendar Body */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-[#1a2230]/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {rows}
          </div>
        </div>

        {/* Side Panel for Selected Date Details */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white dark:bg-[#1a2230] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sticky top-8">
            <h3 className="text-lg font-bold border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
              Evenimente pe <span className="text-primary">{format(selectedDate, 'd MMMM', { locale: ro })}</span>
            </h3>
            
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_available</span>
                <p>Niciun eveniment programat pentru această zi.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateEvents.map((ev, i) => (
                  <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`material-symbols-outlined text-sm p-1.5 rounded-lg
                        ${ev.type === 'TEST' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
                      `}>
                        {ev.type === 'TEST' ? 'quiz' : 'assignment'}
                      </span>
                      <span className="text-xs font-bold text-gray-500 uppercase">
                        {ev.type === 'TEST' ? 'Test Programat' : 'Termen Limită Temă'}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg mb-1">{ev.title}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-4">
                      <span className="material-symbols-outlined text-[16px]">school</span>
                      {ev.courseName}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-red-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {format(parseISO(ev.date), 'HH:mm')}
                      </div>
                      <Link 
                        to={`/catalog/${ev.courseId}`}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Mergi la curs &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Agenda;
