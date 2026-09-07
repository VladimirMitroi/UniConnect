import api from './client';

export async function fetchGlobalAnnouncements() {
  const { data } = await api.get('/api/announcements/global');
  return data;
}

export async function createGlobalAnnouncement(title, content) {
  const { data } = await api.post('/api/announcements/global', { title, content });
  return data;
}

export async function fetchCourseAnnouncements(courseId) {
  const { data } = await api.get(`/api/announcements/course/${courseId}`);
  return data;
}

export async function createCourseAnnouncement(courseId, title, content) {
  const { data } = await api.post(`/api/announcements/course/${courseId}`, { title, content });
  return data;
}

export async function deleteAnnouncement(id) {
  const { data } = await api.delete(`/api/announcements/${id}`);
  return data;
}
