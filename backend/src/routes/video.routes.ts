
import express from 'express';
import { createVideo, getVideos, deleteVideo } from '../controllers/video.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('teacher'));

router.route('/')
    .post(createVideo)
    .get(getVideos);

router.route('/:id')
    .delete(deleteVideo);

export default router;
