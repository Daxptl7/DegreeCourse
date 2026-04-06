import axios from './axios';

export const fetchPublicCourses = async (params = {}) => {
  const response = await axios.get('/courses', { params });
  return response.data;
};

export const fetchCourseBySlug = async (slug) => {
  const response = await axios.get(`/courses/${slug}`);
  return response.data;
};
