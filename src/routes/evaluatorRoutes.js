const express = require('express');
const router = express.Router();
const evaluatorController = require('../controllers/evaluatorController');
const authMiddleware = require('../middleware/auth');

router.get('/dashboard', authMiddleware, evaluatorController.getDashboard);
router.get('/marking-sheet/:evaluationId', authMiddleware, evaluatorController.getMarkingSheet);
router.post('/record-marks', authMiddleware, evaluatorController.recordMarks);
router.post('/schedule', authMiddleware, evaluatorController.scheduleEvaluation);
router.post('/criteria', authMiddleware, evaluatorController.createCriteria);
router.post('/assign-evaluator', authMiddleware, evaluatorController.assignEvaluator);
router.get('/', authMiddleware, evaluatorController.listAllEvaluations);
router.get('/evaluators/list', authMiddleware, evaluatorController.listEvaluators);
router.post('/evaluators/add-external', authMiddleware, evaluatorController.addExternalEvaluator);

module.exports = router;
