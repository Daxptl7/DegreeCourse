import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { 
    createQuestion, 
    getQuestions, 
    addAnswer, 
    toggleStatus 
} from '../controllers/question.controller.js';

const router = express.Router();

// Create Question (Student) - with image upload
router.post('/create', protect, upload.single('questionImage'), createQuestion);

// Get Questions for a Course (Public/Auth)
router.get('/:courseId', protect, getQuestions);

// Add Answer (Teacher/Student)
router.post('/:questionId/answer', protect, addAnswer);

// Update Status (Teacher)
router.patch('/:questionId/status', protect, authorize('teacher'), toggleStatus);

export default router;
