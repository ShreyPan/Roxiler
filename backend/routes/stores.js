const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { getAllStores, getStoreById, addStore } = require('../controllers/storeController');
const roleCheck = require('../middleware/roleCheck');
const { validateAddStore, validateStoreListQuery, validateIdParam, handleValidation } = require('../validators/validators');

router.get('/', auth, validateStoreListQuery, handleValidation, getAllStores);
router.get('/:id', auth, validateIdParam, handleValidation, getStoreById);
router.post('/', auth, roleCheck('admin'), validateAddStore, handleValidation, addStore);

module.exports = router;