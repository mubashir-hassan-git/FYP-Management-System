const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/auth');

router.get('/dashboard', authMiddleware, studentController.getDashboard);
router.get('/milestones', authMiddleware, studentController.getMilestones);
router.get('/feedback', authMiddleware, studentController.getFeedback);
router.get('/results', authMiddleware, studentController.getResults);

module.exports = router;
