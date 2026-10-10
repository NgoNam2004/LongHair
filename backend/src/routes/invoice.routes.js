const express = require('express');
const { body } = require('express-validator');
const invoiceController = require('../controllers/invoice.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

const PAYMENT_METHODS = ['cash', 'transfer', 'momo', 'other'];

// ─── Validations ────────────────────────────────────────────────────────
const createInvoiceValidation = [
  body('customerName').trim().notEmpty().withMessage('Vui lòng nhập tên khách hàng'),
  body('customer').optional().isMongoId().withMessage('Invalid customer ID'),
  body('staff').optional().isMongoId().withMessage('Invalid staff ID'),
  body('services').isArray({ min: 1 }).withMessage('At least one service is required'),
  body('services.*.name').trim().notEmpty().withMessage('Vui lòng nhập tên dịch vụ'),
  body('services.*.price').isFloat({ min: 0 }).withMessage('Price must be a number >= 0'),
  body('services.*.quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be >= 1'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Discount must be a number >= 0'),
  body('paymentMethod').optional().isIn(PAYMENT_METHODS),
  body('paymentStatus').optional().isIn(['pending', 'paid']),
];

const updateInvoiceValidation = [
  body('services').optional().isArray({ min: 1 }),
  body('services.*.name').optional().trim().notEmpty(),
  body('services.*.price').optional().isFloat({ min: 0 }),
  body('services.*.quantity').optional().isInt({ min: 1 }),
  body('discount').optional().isFloat({ min: 0 }),
  body('paymentMethod').optional().isIn(PAYMENT_METHODS),
];

// ─── Routes (tất cả cần đăng nhập) ──────────────────────────────────────
router.use(protect);

router.post('/', validate(createInvoiceValidation), invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/statistics/revenue', authorize('admin'), invoiceController.getRevenueStatistics);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', validate(updateInvoiceValidation), invoiceController.updateInvoice);
router.patch('/:id/pay', invoiceController.payInvoice);
router.patch('/:id/cancel', invoiceController.cancelInvoice);

module.exports = router;