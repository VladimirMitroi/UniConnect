import api from './client';

export async function fetchAverages() {
  const { data } = await api.get('/api/results/averages');
  return data;
}

export async function fetchCourseResults(courseName) {
  const { data } = await api.get(`/api/results/course/${encodeURIComponent(courseName)}`);
  return data;
}
