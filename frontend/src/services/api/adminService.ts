import api from '../../api/axios';

const unwrap = async (request) => {
  const response = await request;
  return response.data;
};

const adminService = {
  getDashboard: () => unwrap(api.get('/admin/dashboard')),
  getUsers: (params) => unwrap(api.get('/admin/users', { params })),
  getUserById: (userId) => unwrap(api.get(`/admin/users/${userId}`)),
  updateUserStatus: (userId, payload) => unwrap(api.put(`/admin/users/${userId}/status`, payload)),
  updateUserApproval: (userId, payload) => unwrap(api.put(`/admin/users/${userId}/approval`, payload)),
  bulkUpdateUsers: (payload) => unwrap(api.post('/admin/users/bulk', payload)),
  deleteUser: (userId) => unwrap(api.delete(`/admin/users/${userId}`)),

  getCourses: (params) => unwrap(api.get('/admin/courses', { params })),
  reviewCourse: (courseId, payload) => unwrap(api.put(`/admin/courses/${courseId}/review`, payload)),
  updateCourse: (courseId, payload) => unwrap(api.put(`/admin/courses/${courseId}`, payload)),
  toggleFeaturedCourse: (courseId, payload) => unwrap(api.put(`/admin/courses/${courseId}/feature`, payload)),
  archiveCourse: (courseId, payload) => unwrap(api.put(`/admin/courses/${courseId}/archive`, payload)),

  getAnnouncements: (params) => unwrap(api.get('/admin/announcements', { params })),
  createAnnouncement: (payload) => unwrap(api.post('/admin/announcements', payload)),
  updateAnnouncement: (announcementId, payload) => unwrap(api.put(`/admin/announcements/${announcementId}`, payload)),
  deleteAnnouncement: (announcementId) => unwrap(api.delete(`/admin/announcements/${announcementId}`)),

  getAnalytics: () => unwrap(api.get('/admin/analytics')),
  getSecurity: () => unwrap(api.get('/admin/security')),

  getSchools: () => unwrap(api.get('/admin/schools')),
  createSchool: (payload) => unwrap(api.post('/admin/schools', payload)),
  updateSchool: (schoolId, payload) => unwrap(api.put(`/admin/schools/${schoolId}`, payload)),
  deleteSchool: (schoolId) => unwrap(api.delete(`/admin/schools/${schoolId}`)),

  getCategories: () => unwrap(api.get('/admin/categories')),
  createCategory: (payload) => unwrap(api.post('/admin/categories', payload)),
  updateCategory: (categoryId, payload) => unwrap(api.put(`/admin/categories/${categoryId}`, payload)),
  deleteCategory: (categoryId) => unwrap(api.delete(`/admin/categories/${categoryId}`))
};

export default adminService;
