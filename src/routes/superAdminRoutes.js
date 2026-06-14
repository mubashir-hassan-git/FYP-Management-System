const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const authMiddleware = require('../middleware/auth');

// Middleware: only super admin role allowed
function requireSuperAdmin(req, res, next) {
    if (req.user && req.user.role === 'superadmin') return next();
    return res.status(403).json({ message: 'Access denied. Super admin only.' });
}

// ── SUPER ADMIN ONLY ─────────────────────────────────────────

// System overview
router.get('/admin/stats',           authMiddleware, requireSuperAdmin, superAdminController.getSystemStats);

// Account management (access control)
router.get('/admin/accounts',         authMiddleware, requireSuperAdmin, superAdminController.listAllAccounts);
router.get('/admin/accounts/:id',     authMiddleware, requireSuperAdmin, superAdminController.getAccount);
router.post('/admin/accounts',        authMiddleware, requireSuperAdmin, superAdminController.createAccount);
router.put('/admin/accounts/:id',     authMiddleware, requireSuperAdmin, superAdminController.updateAccount);
router.delete('/admin/accounts/:id',  authMiddleware, requireSuperAdmin, superAdminController.deleteAccount);
router.patch('/admin/accounts/:id/status', authMiddleware, requireSuperAdmin, superAdminController.setAccountStatus);
router.patch('/admin/accounts/:id/reset-password', authMiddleware, requireSuperAdmin, superAdminController.resetPassword);
router.patch('/admin/accounts/:id/role', authMiddleware, requireSuperAdmin, superAdminController.updateUserRole);

// Audit log removed from system

// Roles list (for dropdowns)
router.get('/admin/roles',            authMiddleware, superAdminController.listRoles);

// ── ALL AUTHENTICATED USERS ───────────────────────────────────

// Profile: view and edit (non-permanent fields only)
router.get('/profile/me',             authMiddleware, superAdminController.getMyProfile);
router.put('/profile/me',             authMiddleware, superAdminController.updateMyProfile);
router.patch('/profile/me/password',  authMiddleware, superAdminController.changeMyPassword);

module.exports = router;
