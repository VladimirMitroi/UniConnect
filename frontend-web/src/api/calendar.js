import api from './client';

export async function fetchStudentCalendar(studentId) {
  const { data } = await api.get(`/api/calendar/student/${studentId}`);
  return data;
}

export async function fetchTeacherCalendar(teacherId) {
  const { data } = await api.get(`/api/calendar/teacher/${teacherId}`);
  return data;
}
