const express = require('express');
const router = express.Router();

const { submitRating, updateRating, getStoreRatings } = require('../controllers/ratingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { validateRating, handleValidation } = require('../validators/validators');

router.post('/', auth, roleCheck('normal'), validateRating, handleValidation, submitRating);
router.put('/', auth, roleCheck('normal'), validateRating, handleValidation, updateRating);
router.get('/store', auth, roleCheck('store_owner'), getStoreRatings);

module.exports = router;