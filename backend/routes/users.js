const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getAllUsers, getUserById, addUser, getAdminStats, updateUserRole } = require('../controllers/userController');
const { validateRegister, validateAddUser, validateUpdateRole, validateUserListQuery, validateIdParam, handleValidation } = require('../validators/validators');

router.get('/stats', auth, roleCheck('admin'), getAdminStats);
router.get('/', auth, roleCheck('admin'), validateUserListQuery, handleValidation, getAllUsers);
router.get('/:id', auth, roleCheck('admin'), validateIdParam, handleValidation, getUserById);
router.post('/', auth, roleCheck('admin'), validateAddUser, handleValidation, addUser);
router.put('/:id/role', auth, roleCheck('admin'), validateIdParam, validateUpdateRole, handleValidation, updateUserRole);

module.exports = router;