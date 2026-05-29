import axios from './axios';

export const enrollInCourse = async (courseId) => {
  const response = await axios.post(`/student/enroll/${courseId}`);
  return response.data;
};

export const addToCart = async (courseId) => {
  const response = await axios.post(`/student/cart/${courseId}`);
  return response.data;
};

export const removeFromCart = async (courseId) => {
  const response = await axios.delete(`/student/cart/${courseId}`);
  return response.data;
};

export const fetchCart = async () => {
  const response = await axios.get('/student/cart');
  return response.data;
};

export const fetchMyCourses = async () => {
    const response = await axios.get('/student/my-courses');
    return response.data;
};

export const updateLectureProgress = async (courseId, lectureId) => {
    const response = await axios.put(`/student/progress/${courseId}/${lectureId}`);
    return response.data;
};

export const fetchCourseProgress = async (courseId) => {
    const response = await axios.get(`/student/progress/${courseId}`);
    return response.data;
};
