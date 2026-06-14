const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinatorController');
const authMiddleware = require('../middleware/auth');

// Student Management
router.get('/students', authMiddleware, coordinatorController.listStudents);
router.get('/students/search', authMiddleware, coordinatorController.searchStudents);
router.post('/students', authMiddleware, coordinatorController.addStudent);
router.put('/students/:id', authMiddleware, coordinatorController.updateStudent);
router.delete('/students/:id', authMiddleware, coordinatorController.deleteStudent);

// Faculty Management
router.get('/faculty', authMiddleware, coordinatorController.listFaculty);
router.post('/faculty', authMiddleware, coordinatorController.addFaculty);
router.put('/faculty/:id', authMiddleware, coordinatorController.updateFaculty);
router.delete('/faculty/:id', authMiddleware, coordinatorController.deleteFaculty);

// Group Management
router.get('/groups', authMiddleware, coordinatorController.listGroups);
router.post('/groups', authMiddleware, coordinatorController.createGroup);
router.delete('/groups/:id', authMiddleware, coordinatorController.deleteGroup);

// Project Management
router.get('/projects', authMiddleware, coordinatorController.listProjects);
router.post('/projects', authMiddleware, coordinatorController.createProject);
router.post('/projects/assign', authMiddleware, coordinatorController.assignProject);
router.put('/projects/:id/status', authMiddleware, coordinatorController.updateProjectStatus);
router.delete('/projects/:id', authMiddleware, coordinatorController.deleteProject);
router.post('/projects/assign-supervisors', authMiddleware, coordinatorController.assignSupervisors);

// Milestone Management
router.get('/milestones', authMiddleware, coordinatorController.listMilestones);
router.post('/milestones', authMiddleware, coordinatorController.createMilestone);
router.put('/milestones/:id', authMiddleware, coordinatorController.updateMilestone);
router.delete('/milestones/:id', authMiddleware, coordinatorController.deleteMilestone);

// Helper dropdown sources
router.get('/batches', authMiddleware, coordinatorController.listBatches);
router.get('/departments', authMiddleware, coordinatorController.listDepartments);
router.get('/dashboard/stats', authMiddleware, coordinatorController.getDashboardStats);

module.exports = router;
