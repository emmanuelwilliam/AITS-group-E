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
    const response = await api.post('issues/create/', issueData);
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

// Assign an issue to a lecturer (admin)
export const assignIssueToLecturer = async (issueId, lecturerId) => {
  const response = await api.post('assign-issue/', { issue_id: issueId, lecturer_id: lecturerId });
  return response.data;
};

// Lecturer updates issue status
export const updateIssueStatus = async (issueId, updateData) => {
  try {
    const response = await api.post('update-issue-status/', {
      issue_id: issueId,
      status: updateData.status,
      resolution_notes: updateData.resolution_notes,
      attachments: updateData.attachments
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Backend responded with error status
      console.error('Status update error:', error.response.data);
      throw new Error(error.response.data.error || 'Failed to update issue status');
    } else if (error.request) {
      // Request was made but no response
      console.error('No response received:', error.request);
      throw new Error('No response from server');
    } else {
      console.error('Error setting up request:', error.message);
      throw new Error('Failed to send update request');
    }
  }
};

// Function to check if status update was successful
export const validateStatusUpdate = async (issueId) => {
  try {
    const response = await api.get(`issues/${issueId}/`);
    return response.data;
  } catch (error) {
    console.error('Error validating status update:', error);
    throw error;
  }
};

// Student fetches their own issues
export const fetchStudentIssues = async () => {
  const token = localStorage.getItem('access_token');
  console.log('[fetchStudentIssues] Access token:', token);
  try {
    const response = await api.get('student/issues/');
    return response.data;
  } catch (err) {
    console.error('[fetchStudentIssues] Error details:', err, err?.response);
    throw err;
  }
};

// Admin fetches statistics
export const fetchAdminStatistics = async () => {
  const response = await api.get('admin/statistics/');
  return response.data;
};
