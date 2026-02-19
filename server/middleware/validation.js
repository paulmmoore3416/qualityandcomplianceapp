const { body, param, query, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 2, max: 50 }).withMessage('Username must be 2-50 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username contains invalid characters'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 4, max: 128 }).withMessage('Password must be 4-128 characters'),
  handleValidationErrors,
];

const complianceDataValidation = [
  body('module')
    .trim()
    .notEmpty().withMessage('Module name is required')
    .isIn(['metrics', 'risks', 'capas', 'ncrs', 'alerts', 'lifecycle', 'lots',
      'validationReports', 'suppliers', 'training', 'changeControls', 'complaints',
      'documents', 'moduleLinks'])
    .withMessage('Invalid module name'),
  body('data')
    .notEmpty().withMessage('Data is required')
    .isObject().withMessage('Data must be an object'),
  handleValidationErrors,
];

const idParamValidation = [
  param('id')
    .trim()
    .notEmpty().withMessage('ID is required'),
  handleValidationErrors,
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('sort').optional().trim().isLength({ max: 50 }),
  query('order').optional().isIn(['asc', 'desc']),
  handleValidationErrors,
];

const auditQueryValidation = [
  query('entityType').optional().trim().isLength({ max: 50 }),
  query('entityId').optional().trim(),
  query('userId').optional().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 5000 }),
  query('offset').optional().isInt({ min: 0 }),
  handleValidationErrors,
];

const exportValidation = [
  query('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
  query('module').optional().trim().isLength({ max: 50 }),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  loginValidation,
  complianceDataValidation,
  idParamValidation,
  paginationValidation,
  auditQueryValidation,
  exportValidation,
};
