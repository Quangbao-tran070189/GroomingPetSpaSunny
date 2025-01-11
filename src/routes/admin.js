const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../config/auth');
const adminController = require('../app/controllers/AdminController');

router.get('/dashboard', ensureAdmin, adminController.dashboard);
router.get('/users', ensureAdmin, adminController.listUsers);
router.get('/users/add', ensureAdmin, adminController.addUserPage);
router.post('/users/add', ensureAdmin, adminController.addUserHandle);
router.get('/users/edit/:id', ensureAdmin, adminController.editUserPage);
router.post('/users/edit/:id', ensureAdmin, adminController.editUserHandle);
router.get('/edit', ensureAdmin, adminController.editAdminPage);
router.post('/edit', ensureAdmin, adminController.editAdminHandle);
router.post('/users/delete/:id', ensureAdmin, adminController.deleteUserHandle);

module.exports = router;
