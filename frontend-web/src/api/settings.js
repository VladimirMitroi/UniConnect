import api from './client';

export async function fetchPublicSettings() {
  const { data } = await api.get('/api/settings/public');
  return data;
}
