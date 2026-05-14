import express from 'express';
import { register, login, getMe, updateDetails } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-details', protect, upload.single('profileImage'), updateDetails);

export default router;
