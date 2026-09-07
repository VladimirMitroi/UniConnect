import api from './client';

export async function fetchAssignmentsForCourse(courseId) {
  const { data } = await api.get(`/api/assignments/course/${courseId}`);
  return data;
}

export async function createAssignment(assignmentData) {
  const { data } = await api.post('/api/assignments', assignmentData);
  return data;
}

export async function submitAssignment(assignmentId, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post(`/api/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function fetchMySubmission(assignmentId) {
  const { data } = await api.get(`/api/assignments/${assignmentId}/my-submission`);
  return data; // Poate fi null/empty (204 No Content) dacă nu a trimis
}

export async function fetchSubmissionsForAssignment(assignmentId) {
  const { data } = await api.get(`/api/assignments/${assignmentId}/submissions`);
  return data;
}

export async function gradeSubmission(submissionId, grade, feedback) {
  const { data } = await api.put(`/api/assignments/submissions/${submissionId}/grade`, {
    grade,
    feedback
  });
  return data;
}

export async function getDownloadUrl(fileName) {
  const { data } = await api.get(`/api/assignments/download/${fileName}`);
  return data.url; // { url: "https://minio..." }
}

export async function autoGradeSubmission(submissionId) {
  const { data } = await api.post(`/api/assignments/submissions/${submissionId}/auto-grade`);
  return data;
}
