import express from 'express';
import { getTeacherProfile, getTeacherCourses, getTeacherStats } from '../controllers/teacher.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply protection to all teacher routes
router.use(protect);
router.use(authorize('teacher', 'admin'));

router.get('/profile', getTeacherProfile);
router.get('/courses', getTeacherCourses);
router.get('/stats', getTeacherStats);

export default router;
