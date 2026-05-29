import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const createdDirs = new Set();
const createDir = (dir) => {
    if (!createdDirs.has(dir)) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        createdDirs.add(dir);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/others';

        if (file.fieldname === 'assignmentFile') {
            uploadPath = 'uploads/assignments';
        } else if (file.fieldname === 'submissionFile') {
            uploadPath = 'uploads/submissions';
        } else if (file.fieldname === 'thumbnail') {
            uploadPath = 'uploads/thumbnails';
        } else if (file.fieldname === 'questionImage') {
            uploadPath = 'uploads/questions';
        } else if (file.fieldname === 'profileImage') {
            uploadPath = 'uploads/avatars';
        }

        createDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Accept standard document types and images
const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg'
];

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed.'), false);
    }
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});
