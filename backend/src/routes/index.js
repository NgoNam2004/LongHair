const express = require('express');
const authRoutes = require('./auth.routes');
const invoiceRoutes = require('./invoice.routes');
const dashboardRoutes = require('./dashboard.routes');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/dashboard', dashboardRoutes);
// You can add other routes here later (customers, services, etc)

module.exports = router;
