const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

// GET /api/dashboard/stats[?days=30]  (days: số ngày tính "dịch vụ phổ biến")
router.get('/stats', dashboardController.getStats);

module.exports = router;