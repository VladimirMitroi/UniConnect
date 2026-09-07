import api from './client';

export async function login(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
}

export async function fetchProfile() {
  const { data } = await api.get('/api/auth/me');
  return data;
}

export function saveProfileToStorage(profile) {
  localStorage.setItem('uniconnect_profile', JSON.stringify(profile));
  localStorage.setItem('uniconnect_name', profile.name || 'Utilizator');
  localStorage.setItem('uniconnect_role', profile.role);
}

export function getProfileFromStorage() {
  const raw = localStorage.getItem('uniconnect_profile');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loadAndStoreProfile() {
  const profile = await fetchProfile();
  saveProfileToStorage(profile);
  return profile;
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.post('/api/auth/change-password', { currentPassword, newPassword });
  return data;
}
