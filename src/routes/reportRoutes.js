const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');

router.get('/data', authMiddleware, reportController.getReportData);
router.get('/export', authMiddleware, reportController.exportReport);

module.exports = router;
