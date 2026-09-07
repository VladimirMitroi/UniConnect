import api from './client';

export async function fetchFlashcards(courseId) {
  const { data } = await api.get(`/api/flashcards/course/${courseId}`);
  return data;
}

export async function generateFlashcards(courseId, fileName, title) {
  const formData = new FormData();
  formData.append('courseId', courseId);
  formData.append('fileName', fileName);
  formData.append('title', title);

  const { data } = await api.post('/api/flashcards/generate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
}
