import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { 
    createAnnouncement, 
    getAnnouncements, 
    markAsRead, 
    getUnreadCounts,
    updateAnnouncement,
    deleteAnnouncement
} from '../controllers/announcement.controller.js';

const router = express.Router();

// Teacher routes
router.post('/create', protect, authorize('teacher'), createAnnouncement);
router.put('/:announcementId', protect, authorize('teacher'), updateAnnouncement);
router.delete('/:announcementId', protect, authorize('teacher'), deleteAnnouncement);

// Public/Student routes (but authenticated)
router.get('/:courseId', protect, getAnnouncements);
router.put('/:announcementId/read', protect, markAsRead);
router.post('/unread-counts', protect, getUnreadCounts);

export default router;
