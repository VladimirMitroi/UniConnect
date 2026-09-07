import api from './client';

export async function createUser(userData) {
  const { data } = await api.post('/api/admin/users/create', userData);
  return data;
}

export async function createCourse(courseData) {
  const { data } = await api.post('/api/admin/courses/create', courseData);
  return data;
}
export async function fetchAllSettings() {
  const { data } = await api.get('/api/settings/admin');
  return data;
}

export async function updateSetting(key, value) {
  const { data } = await api.put(`/api/settings/admin/${key}`, { value });
  return data;
}
