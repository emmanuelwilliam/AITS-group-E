// issueService.js
// Axios instance configured in apiConfig.js with baseURL and auth interceptors
import api from './apiConfig';

// Fetch all issues (list)
//export const fetchIssues = () =>
  //axios.get(`${API_URL}issues/`);
  //api.get('issues/');

// Create a new issue
export const createIssue = async issueData => {
  try {
    const response = await api.post('issues/', issueData);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Backend responded with error status
      console.error('Backend error:', error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};


// Fetch issues for the current student (if your backend filters by user)
export const getStudentIssues = () =>
  api.get('issues/'); // Add query params if needed, e.g. `?student=<id>`

// Assign an issue to a lecturer
export const assignIssue = (issueId, lecturerId) =>
  api.patch(`issues/${issueId}/`, { assigned_to: lecturerId });

// Resolve or update status of an issue
export const resolveIssue = (issueId, status) =>
  api.patch(`issues/${issueId}/`, { status });

// Delete an issue (if needed)
export const deleteIssue = (issueId) =>
  api.delete(`issues/${issueId}/`);
