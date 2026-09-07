import api from './client';

export async function fetchMyCourses(studentId, grupa, serie) {
  const { data } = await api.get('/api/courses/student/my-courses', {
    params: { studentId, grupa, serie },
  });
  return data;
}

export async function fetchExploreCatalog(grupa, serie, studentId) {
  const { data } = await api.get('/api/courses/student/explore', {
    params: { grupa, serie, studentId },
  });
  return data;
}

export async function fetchMyRequests(studentId) {
  const { data } = await api.get('/api/courses/student/my-requests', {
    params: { studentId },
  });
  return data;
}

export async function requestCourseAccess(payload) {
  const { data } = await api.post('/api/courses/student/request-access', payload);
  return data;
}

export async function fetchCourse(courseId) {
  const { data } = await api.get(`/api/courses/${courseId}`);
  return data;
}



export async function markMaterialComplete(materialId) {
  const { data } = await api.post(`/api/courses/materials/${materialId}/complete`);
  return data;
}

export async function fetchCourseProgress(courseId) {
  const { data } = await api.get(`/api/courses/${courseId}/progress`);
  return data;
}

export async function fetchCourseMaterials(courseId) {
  const { data } = await api.get(`/api/courses/${courseId}/materials`);
  return data;
}

export async function fetchEnrollmentForCourse(studentId, courseId) {
  const { data } = await api.get(`/api/enrollments/student/${studentId}/course/${courseId}`);
  return data;
}

export async function fetchStudentEnrollments(studentId) {
  const { data } = await api.get(`/api/enrollments/student/${studentId}`);
  return data;
}

export async function fetchTests() {
  const { data } = await api.get('/api/documents/tests');
  return data;
}

export async function fetchStudentAvailableTests() {
  const { data } = await api.get('/api/tests/student/available');
  return data;
}

export async function fetchQuestionsByTest(testId) {
  const { data } = await api.get('/api/questions/filter-by-test', {
    params: { testId },
  });
  return data;
}

export async function saveTestResult(payload) {
  const { data } = await api.post('/api/results/save', payload);
  return data;
}

export async function startTest(testId) {
  const { data } = await api.post(`/api/tests/${testId}/start`);
  return data;
}

export async function submitTest(testId, payload) {
  const { data } = await api.post(`/api/tests/${testId}/submit`, payload);
  return data;
}


export async function generateCourseWeeks(courseId) {
  const { data } = await api.post(`/api/courses/${courseId}/generate-weeks`);
  return data;
}

export async function generatePracticeTest(fileName, testTitle, numQuestions, questionType, courseInstanceId) {
  const formData = new FormData();
  formData.append('fileName', fileName);
  formData.append('testTitle', testTitle);
  formData.append('numQuestions', numQuestions);
  formData.append('questionType', questionType);
  formData.append('courseInstanceId', courseInstanceId);

  const { data } = await api.post('/api/documents/generate-practice', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
}

export async function saveStructure(courseId, sections) {
  const { data } = await api.put(`/api/courses/${courseId}/structure`, sections);
  return data;
}

export async function generatePodcast(fileName, courseInstanceId, sectionId) {
  const formData = new FormData();
  formData.append('fileName', fileName);
  formData.append('courseInstanceId', courseInstanceId);
  formData.append('sectionId', sectionId);
  
  const { data } = await api.post('/api/documents/podcast', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
}

export async function deleteCourseMaterial(materialId) {
  const { data } = await api.delete(`/api/courses/materials/${materialId}`);
  return data;
}

export async function fetchCourseStructure(courseId) {
  const { data } = await api.get(`/api/courses/${courseId}/structure`);
  return data;
}

export async function toggleSectionVisibility(sectionId, isVisible) {
  const { data } = await api.put(`/api/courses/sections/${sectionId}/visibility?isVisible=${isVisible}`);
  return data;
}

export async function assignMaterialToSection(materialId, sectionId) {
  const url = sectionId 
    ? `/api/courses/materials/${materialId}/section?sectionId=${sectionId}`
    : `/api/courses/materials/${materialId}/section`;
  const { data } = await api.put(url);
  return data;
}

export async function uploadMaterialToCourse(courseId, sectionId, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = sectionId 
    ? `/api/courses/${courseId}/materials/upload?sectionId=${sectionId}`
    : `/api/courses/${courseId}/materials/upload`;
    
  const { data } = await api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}
export const updateCourseImage = async (courseId, imageUrl) => {
  const { data } = await api.put(`/api/courses/${courseId}/image`, { imageUrl });
  return data;
};

export async function fetchCourseStudents(courseId) {
  const { data } = await api.get(`/api/courses/${courseId}/students`);
  return data;
}
