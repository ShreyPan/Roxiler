const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { validateRegister, validateLogin, validateUpdatePassword, validateUpdateProfile, handleValidation } = require('../validators/validators');
const { registerUser, loginUser, updatePassword, getMe, updateMe } = require('../controllers/authController');

router.post('/register', validateRegister, handleValidation, registerUser);
router.post('/login', validateLogin, handleValidation, loginUser);
router.put('/password', auth, validateUpdatePassword, handleValidation, updatePassword);
router.get('/me', auth, getMe);
router.put('/me', auth, validateUpdateProfile, handleValidation, updateMe);

module.exports = router;