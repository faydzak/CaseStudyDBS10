const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/authMiddleware');
const { userRegistrationValidation, userUpdateValidation, validate } = require('../utils/validators');

// Public routes
router.post('/register', userRegistrationValidation, validate, UserController.register);
router.post('/login', UserController.login);

// Static protected routes MUST come before /:email to avoid param conflicts
router.get('/history', authenticateToken, UserController.getTransactionHistory);
router.get('/total-spent', authenticateToken, UserController.getTotalSpent);
router.put('/update', authenticateToken, userUpdateValidation, validate, UserController.updateProfile); // Task 3

// Dynamic route — must be last among GET routes
router.get('/:email', authenticateToken, UserController.getUserByEmail); // Task 2

module.exports = router;
