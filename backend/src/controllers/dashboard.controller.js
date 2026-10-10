const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.query);
  return successResponse(res, 200, 'Dashboard statistics retrieved successfully', stats);
});

module.exports = { getStats };