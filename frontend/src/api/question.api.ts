import api from './axios';

// Create Question (Student) - Multipart
export const createQuestion = async (formData) => {
    const response = await api.post('/questions/create', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Get Questions for Course
export const getQuestions = async (courseId) => {
    const response = await api.get(`/questions/${courseId}`);
    return response.data;
};

// Add Answer
export const addAnswer = async (questionId, content) => {
    const response = await api.post(`/questions/${questionId}/answer`, { content });
    return response.data;
};

// Toggle Status (Teacher side usually)
export const toggleStatus = async (questionId, status) => {
    const response = await api.patch(`/questions/${questionId}/status`, { status });
    return response.data;
};
