const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../middleware/auth');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/submissions');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer – disk storage with timestamp-prefixed filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename:    (req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safe}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.docx', '.pptx', '.zip', '.txt', '.xlsx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) return cb(null, true);
        cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowed.join(', ')}`));
    }
});

// All submissions for a project (any milestone) – student submissions page
router.get('/project/:projectId', authMiddleware, submissionController.getAllForProject);

// Submission history for specific project + milestone
router.get('/history/:projectId/:milestoneId', authMiddleware, submissionController.getHistory);

// Create new submission (with optional file)
router.post('/', authMiddleware, upload.single('submissionFile'), (err, req, res, next) => {
    // multer error handler
    if (err) return res.status(400).json({ message: err.message });
    next();
}, submissionController.createSubmission);

// Download file
router.get('/download/:fileId', authMiddleware, submissionController.downloadFile);

// List all (coordinator)
router.get('/', authMiddleware, submissionController.listAllSubmissions);

// Single submission detail (faculty review)
router.get('/:submissionId', authMiddleware, submissionController.getSubmissionDetail);

module.exports = router;
