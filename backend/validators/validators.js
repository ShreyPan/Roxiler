const { body, query, param, validationResult } = require('express-validator');

const cleanText = (value) => {
    if (typeof value !== 'string') {
        return value;
    }

    return value
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const cleanEmail = (value) => {
    if (typeof value !== 'string') {
        return value;
    }

    return value.trim().toLowerCase();
};

const allowedSortOrder = ['asc', 'desc'];

const validateIdParam = [
    param('id').toInt().isInt({ min: 1 }).withMessage('Invalid id')
];

const validateUserListQuery = [
    query('sortBy').optional().trim().isIn(['id', 'name', 'email', 'role']).withMessage('Invalid sort field'),
    query('order').optional().trim().toLowerCase().isIn(allowedSortOrder).withMessage('Invalid sort order')
];

const validateStoreListQuery = [
    query('sortBy').optional().trim().isIn(['id', 'name', 'address', 'averageRating']).withMessage('Invalid sort field'),
    query('order').optional().trim().toLowerCase().isIn(allowedSortOrder).withMessage('Invalid sort order')
];

const validateRegister = [
    body('name').customSanitizer(cleanText).isLength({ min: 20, max: 60 }).withMessage('Name must be at least 20 characters long'),
    body('email').customSanitizer(cleanEmail).isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8, max: 16 }).matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/).withMessage('Password must be 8-16 characters long, contain at least one uppercase letter and one special character'),
    body('address').customSanitizer(cleanText).isLength({ min: 10, max: 400 }).withMessage('Address must be between 10 and 400 characters')
];

const validateLogin = [
    body('email').customSanitizer(cleanEmail).isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8, max: 16 }).matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/).withMessage('Password must be 8-16 characters long, contain at least one uppercase letter and one special character')
];

const validateRating = [
    body('store_id').toInt().isInt({ min: 1 }).withMessage('Invalid store id'),
    body('value').toInt().isInt({ min: 1, max: 5 }).withMessage('Rating value must be an integer between 1 and 5')
];

const validateUpdatePassword = [
    body('oldPassword').isString().notEmpty().withMessage('Old password is required'),
    body('newPassword').isLength({ min: 8, max: 16 }).matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/).withMessage('Password must be 8-16 characters long, contain at least one uppercase letter and one special character')
];

const validateUpdateProfile = [
    body().custom((_, { req }) => req.body.name !== undefined || req.body.address !== undefined).withMessage('At least one profile field is required'),
    body('name').optional().customSanitizer(cleanText).isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters'),
    body('address').optional().customSanitizer(cleanText).isLength({ min: 10, max: 400 }).withMessage('Address must be between 10 and 400 characters')
];

const validateAddUser = [
    body('name').customSanitizer(cleanText).isLength({ min: 20, max: 60 }).withMessage('Name must be at least 20 characters long'),
    body('email').customSanitizer(cleanEmail).isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8, max: 16 }).matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/).withMessage('Password must be 8-16 characters long, contain at least one uppercase letter and one special character'),
    body('address').customSanitizer(cleanText).isLength({ min: 10, max: 400 }).withMessage('Address must be between 10 and 400 characters'),
    body('role').trim().isIn(['admin', 'normal', 'store_owner']).withMessage('Invalid role')
];

const validateAddStore = [
    body('name').customSanitizer(cleanText).isLength({ min: 1, max: 60 }).withMessage('Store name is required'),
    body('email').customSanitizer(cleanEmail).isEmail().withMessage('Invalid email format'),
    body('address').customSanitizer(cleanText).isLength({ min: 1, max: 400 }).withMessage('Address is required'),
    body('owner_id').toInt().isInt({ min: 1 }).withMessage('Invalid owner id')
];

const validateUpdateRole = [
    body('role').trim().isIn(['admin', 'normal', 'store_owner']).withMessage('Invalid role')
];

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateRating,
    validateUpdatePassword,
    validateUpdateProfile,
    validateAddUser,
    validateAddStore,
    validateUpdateRole,
    validateUserListQuery,
    validateStoreListQuery,
    validateIdParam,
    handleValidation,
};