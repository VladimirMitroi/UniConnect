import api from './client';

export async function fetchContacts() {
  const { data } = await api.get('/api/messages/contacts');
  return data;
}

export async function searchUser(query) {
  const { data } = await api.get('/api/messages/search-user', {
    params: { query }
  });
  return data;
}

export async function fetchChatHistory(otherUserId) {
  const { data } = await api.get(`/api/messages/history/${otherUserId}`);
  return data;
}

export async function sendMessage(receiverId, content) {
  const { data } = await api.post('/api/messages/send', { receiverId, content });
  return data;
}
