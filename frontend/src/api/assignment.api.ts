import api from './axios';

// Create Assignment (Teacher) - Multipart
export const createAssignment = async (formData) => {
    const response = await api.post('/assignments/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Get Assignments (Student/Teacher)
export const getAssignments = async (courseId) => {
    const response = await api.get(`/assignments/${courseId}`);
    return response.data;
};

// Submit Assignment (Student) - Multipart
export const submitAssignment = async (assignmentId, formData) => {
    const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Get Submissions (Teacher)
export const getSubmissions = async (assignmentId) => {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
};

// Grade Submission (Teacher)
export const gradeSubmission = async (assignmentId, submissionId, data) => {
    const response = await api.put(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data);
    return response.data;
};
