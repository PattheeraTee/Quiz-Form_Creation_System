const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const verifyUser = require('../../middleware');


router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/users', userController.getAllUsers);
router.get('/users/:id', verifyUser, userController.getUserById);

router.post("/forgot-password", userController.forgotPassword);
router.post("/change-password", userController.changePassword);

module.exports = router;
