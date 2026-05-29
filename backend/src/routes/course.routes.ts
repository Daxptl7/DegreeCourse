import express from 'express';
import { getAllCourses, getCourseBySlug, createCourse, addSection, addLecture } from '../controllers/course.controller.js';
import { protect, authorize, optionalProtect } from '../middlewares/auth.middleware.js';

import { uploadVideo, uploadThumbnail } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:slug', optionalProtect, getCourseBySlug);

router.post('/', protect, authorize('teacher', 'admin'), uploadThumbnail.single('thumbnail'), createCourse);
router.put('/:courseId/sections', protect, authorize('teacher', 'admin'), addSection);
router.put('/:courseId/sections/:sectionId/lectures', protect, authorize('teacher', 'admin'), uploadVideo.single('video'), addLecture);

export default router;
