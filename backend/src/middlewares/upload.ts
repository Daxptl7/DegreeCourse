import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const videoUploadDir = 'uploads/videos';
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

// Video storage configuration (disk — videos are large)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Thumbnail storage configuration (memory — we convert to Base64 for MongoDB)
const thumbnailStorage = multer.memoryStorage();

// Video file filter
const videoFileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/x-matroska', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, WebM, and MKV are allowed.'), false);
  }
};

// Thumbnail file filter (JPG/PNG only)
const thumbnailFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG and PNG images are allowed.'), false);
  }
};

export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

export const uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: thumbnailFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
