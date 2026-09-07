import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { getProfileFromStorage, loadAndStoreProfile } from '../api/auth';
import { fetchStudentSchedule, fetchProfessorSchedule } from '../api/schedule';
import { fetchPublicSettings } from '../api/settings';

const locales = { ro };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const DAY_OFFSET = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
};

function slotToEvent(slot, currentDate) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const offset = DAY_OFFSET[slot.dayOfWeek] ?? 0;
  const base = addDays(weekStart, offset);

  const [sh, sm, ss = 0] = slot.startTime.split(':').map(Number);
  const [eh, em, es = 0] = slot.endTime.split(':').map(Number);

  const start = new Date(base);
  start.setHours(sh, sm, ss, 0);
  const end = new Date(base);
  end.setHours(eh, em, es, 0);

  return {
    id: slot.id,
    title: `${slot.courseName} · ${slot.room}`,
    start,
    end,
    resource: slot,
  };
}

function Orar() {
  const [slots, setSlots] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('week');

  const role = localStorage.getItem('uniconnect_role');

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const publicSettings = await fetchPublicSettings();
      setSettings(publicSettings);
      if (publicSettings && publicSettings.academic_start_date) {
        const startD = parse(publicSettings.academic_start_date, 'yyyy-MM-dd', new Date());
        const diffDays = (new Date() - startD) / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 120) {
          setCurrentDate(startD);
        }
      }
      let profile = getProfileFromStorage();
      if (!profile?.userId) {
        profile = await loadAndStoreProfile();
      }

      let fetchedSlots = [];
      if (role === 'ROLE_STUDENT' && profile?.studentId) {
        fetchedSlots = await fetchStudentSchedule(profile.studentId);
      } else if (role === 'ROLE_TEACHER' && profile?.professorId) {
        fetchedSlots = await fetchProfessorSchedule(profile.professorId);
      } else {
        setError('Profilul nu conține date pentru afișarea orarului.');
        return;
      }

      setSlots(fetchedSlots);
    } catch (err) {
      console.error(err);
      setError('Nu am putut încărca orarul.');
    } finally {
      setLoading(false);
    }
  };

  const events = useMemo(() => {
    if (!settings || !settings.academic_start_date) return [];

    const startDate = parse(settings.academic_start_date, 'yyyy-MM-dd', new Date());
    const weeksCount = parseInt(settings.academic_weeks || '14', 10);
    const holidaysStr = settings.academic_holidays || '';

    const holidayPeriods = holidaysStr.split(',').filter(Boolean).map(range => {
      const [s, e] = range.split(':');
      return {
        start: parse(s, 'yyyy-MM-dd', new Date()),
        end: parse(e, 'yyyy-MM-dd', new Date())
      };
    });

    const validWeeks = [];
    let currentIterDate = startDate;
    let generatedWeeks = 0;

    while (generatedWeeks < weeksCount) {
      const iterEndDate = addDays(currentIterDate, 6);
      
      let isHoliday = false;
      for (const period of holidayPeriods) {
        if (currentIterDate <= period.end && iterEndDate >= period.start) {
          isHoliday = true;
          break;
        }
      }

      if (!isHoliday) {
        generatedWeeks++;
        validWeeks.push({ start: currentIterDate, end: iterEndDate });
      }
      
      currentIterDate = addDays(currentIterDate, 7);
    }

    const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const currentWeekEnd = addDays(currentWeekStart, 6);

    const isValidWeek = validWeeks.some(w => {
      return currentWeekStart <= w.end && currentWeekEnd >= w.start;
    });

    if (!isValidWeek) {
      return [];
    }

    return slots.map(slot => slotToEvent(slot, currentDate));
  }, [slots, currentDate, settings]);


  const messages = useMemo(
    () => ({
      today: 'Azi',
      previous: 'Înapoi',
      next: 'Înainte',
      month: 'Lună',
      week: 'Săptămână',
      day: 'Zi',
      agenda: 'Agendă',
      noEventsInRange: 'Nicio activitate programată.',
    }),
    []
  );

  const formats = useMemo(
    () => ({
      dayRangeHeaderFormat: ({ start, end }, culture, local) =>
        `${local.format(start, 'dd MMM', culture)} – ${local.format(end, 'dd MMM yyyy', culture)}`,
      dayHeaderFormat: (date, culture, local) =>
        local.format(date, 'EEEE, dd MMMM yyyy', culture),
    }),
    []
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-primary">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#0d121b] dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">calendar_month</span>
          Orar {role === 'ROLE_TEACHER' ? 'Predare' : 'Personal'}
        </h2>
        <p className="text-[#4c669a] mt-1">
          Săptămâna curentă — orele {role === 'ROLE_TEACHER' ? 'la care predai' : 'la care ești înscris'}.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>
      )}

      <div className="bg-white dark:bg-[#1a2230] rounded-xl border p-4 h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          view={currentView}
          onView={setCurrentView}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          step={30}
          timeslots={2}
          min={new Date(1970, 0, 1, 8, 0)}
          max={new Date(1970, 0, 1, 20, 0)}
          culture="ro"
          messages={messages}
          formats={formats}
          popup
          eventPropGetter={() => ({
            style: {
              backgroundColor: '#135bec',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
            },
          })}
        />
      </div>
    </div>
  );
}

export default Orar;
