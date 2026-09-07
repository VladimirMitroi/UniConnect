import api from './client';

export async function sendChatMessage(courseId, message) {
  const { data } = await api.post(`/api/chat/course/${courseId}`, { message });
  return data;
}
