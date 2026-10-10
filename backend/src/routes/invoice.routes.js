const express = require('express');
const { body } = require('express-validator');
const invoiceController = require('../controllers/invoice.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Validations
const createInvoiceValidation = [
  body('customer').isMongoId().withMessage('Invalid customer ID'),
  body('staff').isMongoId().withMessage('Invalid staff ID'),
  body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
  body('services.*.service').isMongoId().withMessage('Invalid service ID in array'),
  body('services.*.price').isNumeric().withMessage('Price must be a number'),
];

const updateInvoiceValidation = [
  body('services').optional().isArray(),
  body('discount').optional().isNumeric(),
  body('paymentMethod').optional().isIn(['cash', 'banking', 'momo', 'other']),
];

// All routes are protected
router.use(protect);

router.post('/', validate(createInvoiceValidation), invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/statistics/revenue', authorize('admin'), invoiceController.getRevenueStatistics);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', validate(updateInvoiceValidation), invoiceController.updateInvoice);
router.patch('/:id/pay', invoiceController.payInvoice);
router.patch('/:id/cancel', invoiceController.cancelInvoice);

module.exports = router;
