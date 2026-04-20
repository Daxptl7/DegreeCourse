import axios from './axios';

export const fetchTeacherProfile = async () => {
    const response = await axios.get('/teacher/profile');
    return response.data;
};

export const fetchTeacherCourses = async () => {
    const response = await axios.get('/teacher/courses');
    return response.data;
};

export const fetchTeacherStats = async () => {
    const response = await axios.get('/teacher/stats');
    return response.data;
};

export const createCourse = async (courseData) => {
    const isFormData = courseData instanceof FormData;
    const response = await axios.post('/courses', courseData,
        isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
    return response.data;
};

export const addSection = async (courseId, sectionData) => {
    const response = await axios.put(`/courses/${courseId}/sections`, sectionData);
    return response.data;
};

export const addLecture = async (courseId, sectionId, lectureData) => {
    const isFormData = lectureData instanceof FormData;
    const response = await axios.put(
        `/courses/${courseId}/sections/${sectionId}/lectures`,
        lectureData,
        isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
    return response.data;
};
