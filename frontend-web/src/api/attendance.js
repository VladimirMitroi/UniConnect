import api from './client';

export async function startAttendanceSession(courseInstanceId, courseSectionId, validityMinutes = 10) {
  const { data } = await api.post('/api/attendance/start', {
    courseInstanceId,
    courseSectionId,
    validityMinutes,
  });
  return data;
}

export async function checkInAttendance(code) {
  const { data } = await api.post('/api/attendance/check-in', { code });
  return data;
}

export async function fetchCourseAttendanceReport(courseId) {
  const { data } = await api.get(`/api/attendance/course/${courseId}`);
  return data;
}

export async function getActiveSessionForSection(sectionId) {
  const { data } = await api.get(`/api/attendance/active/${sectionId}`);
  return data;
}
