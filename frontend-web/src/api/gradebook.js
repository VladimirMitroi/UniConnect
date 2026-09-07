import api from './client';

export async function fetchCourseGradebook(courseId) {
  const { data } = await api.get(`/api/gradebook/course/${courseId}`);
  return data;
}

export async function fetchStudentGradebook(courseId, studentId) {
  const { data } = await api.get(`/api/gradebook/student/${studentId}/course/${courseId}`);
  return data;
}

export async function updateGradebookWeights(courseId, payload) {
  const { data } = await api.put(`/api/gradebook/course/${courseId}/weights`, payload);
  return data;
}
