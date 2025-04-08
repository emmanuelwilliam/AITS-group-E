import api from './apiConfig';

export const createIssue = async (issueData) => {
  const response = await api.post('/issues', issueData);
  return response.data;
};

export const getStudentIssues = async () => {
  const response = await api.get('/issues/student');
  return response.data;
};

export const getAllIssues = async () => {
  const response = await api.get('/issues');
  return response.data;
};

export const assignIssue = async (issueId, lecturerId) => {
  const response = await api.patch(`/issues/${issueId}/assign`, { lecturerId });
  return response.data;
};

export const resolveIssue = async (issueId, resolution) => {
  const response = await api.patch(`/issues/${issueId}/resolve`, { resolution });
  return response.data;
};