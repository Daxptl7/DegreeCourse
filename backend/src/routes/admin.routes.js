import express from 'express';
import {
  archiveCourse,
  bulkUpdateUsers,
  createAdminAnnouncement,
  createCategory,
  createSchool,
  deleteAdminAnnouncement,
  deleteCategory,
  deleteSchool,
  deleteUser,
  getAdminAnnouncements,
  getAnalytics,
  getCategories,
  getCourses,
  getDashboard,
  getSchools,
  getSecurityMonitoring,
  getUserById,
  getUsers,
  reviewCourse,
  toggleFeaturedCourse,
  updateAdminAnnouncement,
  updateCategory,
  updateCourse,
  updateSchool,
  updateUserApproval,
  updateUserStatus
} from '../controllers/admin.controller.js';
import { ADMIN_ROLES, ROLES } from '../config/roles.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authMiddleware, roleMiddleware(...ADMIN_ROLES));

router.get('/dashboard', getDashboard);

router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/status', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateUserStatus);
router.put('/users/:userId/approval', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MODERATOR), updateUserApproval);
router.post('/users/bulk', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MODERATOR), bulkUpdateUsers);
router.delete('/users/:userId', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteUser);

router.get('/courses', getCourses);
router.put('/courses/:courseId/review', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MODERATOR), reviewCourse);
router.put('/courses/:courseId', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateCourse);
router.put('/courses/:courseId/feature', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN), toggleFeaturedCourse);
router.put('/courses/:courseId/archive', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN), archiveCourse);

router.get('/announcements', getAdminAnnouncements);
router.post('/announcements', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN), createAdminAnnouncement);
router.put('/announcements/:announcementId', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateAdminAnnouncement);
router.delete('/announcements/:announcementId', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteAdminAnnouncement);

router.get('/analytics', getAnalytics);
router.get('/security', getSecurityMonitoring);

router.get('/schools', getSchools);
router.post('/schools', roleMiddleware(ROLES.SUPER_ADMIN), createSchool);
router.put('/schools/:schoolId', roleMiddleware(ROLES.SUPER_ADMIN), updateSchool);
router.delete('/schools/:schoolId', roleMiddleware(ROLES.SUPER_ADMIN), deleteSchool);

router.get('/categories', getCategories);
router.post('/categories', roleMiddleware(ROLES.SUPER_ADMIN), createCategory);
router.put('/categories/:categoryId', roleMiddleware(ROLES.SUPER_ADMIN), updateCategory);
router.delete('/categories/:categoryId', roleMiddleware(ROLES.SUPER_ADMIN), deleteCategory);

export default router;
