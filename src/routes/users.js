const express = require('express');
const router = express.Router();
const passport = require('passport');
const usersController = require('../app/controllers/UsersController');

router.get('/login', usersController.loginPage);
router.post('/login', usersController.loginHandle);
router.get('/logout', usersController.logoutHandle);

module.exports = router;
