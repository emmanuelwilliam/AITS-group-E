// issueService.js
import api from './apiConfig';

export const createIssue = async (issueData) => {
  const response = await api.post('issue/create/', issueData); // Changed endpoint
  return response.data;
};

export const getStudentIssues = async () => {
  const response = await api.get('issue/'); // Filtering might be handled by your viewset
  return response.data;
};

export const getAllIssues = async () => {
  const response = await api.get('issue/');
  return response.data;
};

export const assignIssue = async (issueId, lecturerId) => {
  const response = await api.patch(`issue/${issueId}/`, { 
    assigned_to: lecturerId 
  });
  return response.data;
};

export const resolveIssue = async (issueId, resolution) => {
  const response = await api.patch(`issue/${issueId}/`, { 
    status: resolution 
  });
  return response.data;
};