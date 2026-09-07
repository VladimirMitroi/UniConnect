import api from './client';

export async function fetchAvailableFiles() {
  const { data } = await api.get('/api/documents/files');
  return data;
}

export async function fetchExistingTests() {
  const { data } = await api.get('/api/documents/tests');
  return data;
}

export async function fetchPendingRequests(professorId) {
  const { data } = await api.get('/api/courses/professor/requests', {
    params: { professorId },
  });
  return data;
}

export async function respondToRequest(requestId, status) {
  const { data } = await api.put(
    `/api/courses/professor/respond-request/${requestId}`,
    {},
    { params: { status } }
  );
  return data;
}

export async function uploadFile(file, courseInstanceId) {
  const formData = new FormData();
  formData.append('file', file);
  if (courseInstanceId) {
    formData.append('courseInstanceId', courseInstanceId);
  }
  const { data } = await api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function generateTest({ fileName, testTitle, numQuestions, questionType, courseInstanceId }) {
  const formData = new FormData();
  formData.append('fileName', fileName);
  formData.append('testTitle', testTitle);
  formData.append('numQuestions', numQuestions);
  formData.append('questionType', questionType);
  if (courseInstanceId) {
    formData.append('courseInstanceId', courseInstanceId);
  }
  const { data } = await api.post('/api/documents/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteTest(testId) {
  const { data } = await api.delete(`/api/documents/test/${testId}`);
  return data;
}

export async function fetchProfessorCourses(professorId) {
  const { data } = await api.get('/api/courses/professor/list', {
    params: { professorId },
  });
  return data;
}
