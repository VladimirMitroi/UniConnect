import api from './client';

export async function fetchAllQuestions() {
  const { data } = await api.get('/api/questions');
  return data;
}

export async function fetchQuestionCourses() {
  const { data } = await api.get('/api/questions/courses');
  return data;
}

export async function fetchFilteredQuestions(courseName) {
  const { data } = await api.get('/api/questions/filter', {
    params: { name: courseName },
  });
  return data;
}

export async function updateQuestion(questionId, questionData) {
  const { data } = await api.put(`/api/questions/${questionId}`, questionData);
  return data;
}

export async function deleteQuestion(questionId) {
  const { data } = await api.delete(`/api/questions/${questionId}`);
  return data;
}

export async function fetchCourseQuestionBank(courseId) {
  const { data } = await api.get(`/api/questions/course/${courseId}`);
  return data;
}
