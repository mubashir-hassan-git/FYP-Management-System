const express = require('express');
const router = Router();
const facultyController = require('../controllers/facultyController');
const authMiddleware = require('../middleware/auth');

function Router() {
    return express.Router();
}

router.get('/dashboard', authMiddleware, facultyController.getDashboard);
router.get('/projects', authMiddleware, facultyController.getProjects);
router.get('/groups', authMiddleware, facultyController.getGroups);
router.get('/submissions', authMiddleware, facultyController.getSubmissions);
router.post('/feedback', authMiddleware, facultyController.addFeedback);
router.put('/feedback/:feedbackId', authMiddleware, facultyController.updateFeedback);

module.exports = router;
