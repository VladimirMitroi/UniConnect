import api from './client';

export async function fetchStudentSchedule(studentId) {
  const { data } = await api.get('/api/schedule/student', {
    params: { studentId },
  });
  return data;
}

export async function fetchProfessorSchedule(professorId) {
  const { data } = await api.get('/api/schedule/professor', {
    params: { professorId },
  });
  return data;
}

export async function fetchCourseSchedule(courseId) {
  const { data } = await api.get(`/api/schedule/course/${courseId}`);
  return data;
}

export async function addScheduleSlot(payload) {
  const { data } = await api.post('/api/schedule/add', payload);
  return data;
}

export async function deleteScheduleSlot(slotId) {
  const { data } = await api.delete(`/api/schedule/${slotId}`);
  return data;
}
