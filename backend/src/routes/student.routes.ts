import express from 'express';
import { enrollCourse, addToCart, removeFromCart, getCart, getEnrolledCourses } from '../controllers/student.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../config/roles.js';

const router = express.Router();

// protect all routes
router.use(protect);
router.use(authorize(ROLES.STUDENT, ROLES.TEACHER));

router.post('/enroll/:courseId', enrollCourse);
router.post('/cart/:courseId', addToCart);
router.delete('/cart/:courseId', removeFromCart);
router.get('/cart', getCart);
router.get('/my-courses', getEnrolledCourses);

// Progress routes
import { toggleLectureProgress, getCourseProgress } from '../controllers/student.controller.js';
router.put('/progress/:courseId/:lectureId', toggleLectureProgress);
router.get('/progress/:courseId', getCourseProgress);

export default router;
