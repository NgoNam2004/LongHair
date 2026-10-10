const invoiceService = require('../services/invoice.service');
const { successResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body, req.user._id);
  return successResponse(res, 201, 'Invoice created successfully', invoice);
});

const getInvoices = asyncHandler(async (req, res) => {
  const { invoices, pagination } = await invoiceService.getInvoices(req.query);
  return successResponse(res, 200, 'Invoices retrieved successfully', invoices, pagination);
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  return successResponse(res, 200, 'Invoice retrieved successfully', invoice);
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
  return successResponse(res, 200, 'Invoice updated successfully', invoice);
});

const payInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.payInvoice(req.params.id);
  return successResponse(res, 200, 'Invoice paid successfully', invoice);
});

const cancelInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.cancelInvoice(req.params.id);
  return successResponse(res, 200, 'Invoice cancelled successfully', invoice);
});

const getRevenueStatistics = asyncHandler(async (req, res) => {
  const stats = await invoiceService.getRevenueStatistics(req.query);
  return successResponse(res, 200, 'Revenue statistics retrieved successfully', stats);
});

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  payInvoice,
  cancelInvoice,
  getRevenueStatistics
};
