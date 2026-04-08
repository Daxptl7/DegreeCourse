import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import studentRoutes from './routes/student.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import adminRoutes from './routes/admin.routes.js';
import videoRoutes from './routes/video.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import questionRoutes from './routes/question.routes.js';
import { logApiError } from './services/admin-log.service.js';

const app = express();


// Middleware
app.use(cors({
  origin: [config.frontend.url, 'http://10.30.56.114:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/questions', questionRoutes);

// Static Uploads
import path from 'path';
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  void logApiError({ err, req, statusCode });
  console.error(err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

export default app;
