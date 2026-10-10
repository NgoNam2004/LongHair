const Invoice = require('../models/Invoice');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

// Generate unique invoice code
const generateInvoiceCode = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const prefix = `HD${dateStr}`;
  
  // Find latest invoice of the day
  const latestInvoice = await Invoice.findOne({
    invoiceCode: new RegExp(`^${prefix}`)
  }).sort({ invoiceCode: -1 });

  let sequence = 1;
  if (latestInvoice) {
    const lastSequence = parseInt(latestInvoice.invoiceCode.substring(prefix.length), 10);
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

const createInvoice = async (data, userId) => {
  data.invoiceCode = await generateInvoiceCode();
  data.createdBy = userId;
  
  const invoice = new Invoice(data);
  await invoice.save();
  return invoice;
};

const getInvoices = async (query) => {
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    paymentStatus,
    staffId,
    customerId,
    search
  } = query;

  const filter = {};

  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (staffId) filter.staff = staffId;
  if (customerId) filter.customer = customerId;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Populate references to allow searching by customer name if needed.
  // Mongoose doesn't support direct regex search on populated fields easily in find()
  // So we might search by customer id if search is provided.
  // For simplicity, omitting search or implement basic string match on note/invoiceCode
  if (search) {
     filter.$or = [
       { invoiceCode: { $regex: search, $options: 'i' } },
       { note: { $regex: search, $options: 'i' } }
     ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate('customer', 'name phone')
      .populate('staff', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Invoice.countDocuments(filter)
  ]);

  return {
    invoices,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id)
    .populate('customer', 'name phone email gender')
    .populate('staff', 'name phone speciality')
    .populate('services.service', 'name category duration')
    .populate('appointment', 'date time status')
    .populate('createdBy', 'name username');

  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }
  return invoice;
};

const updateInvoice = async (id, data) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  if (invoice.paymentStatus !== 'pending') {
    throw new ApiError(400, 'Only pending invoices can be updated');
  }
  
  Object.assign(invoice, data);
  await invoice.save();
  return invoice;
};

const payInvoice = async (id) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  if (invoice.paymentStatus === 'paid') {
    throw new ApiError(400, 'Invoice is already paid');
  }
  
  invoice.paymentStatus = 'paid';
  await invoice.save();
  return invoice;
};

const cancelInvoice = async (id) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  if (invoice.paymentStatus === 'paid') {
    throw new ApiError(400, 'Cannot cancel a paid invoice');
  }
  
  invoice.paymentStatus = 'cancelled';
  await invoice.save();
  return invoice;
};

const getRevenueStatistics = async (query) => {
  const { type = 'month' } = query; // day, week, month
  
  let matchStage = { paymentStatus: 'paid' };
  
  // Pipeline for aggregating revenue
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$finalAmount' },
        totalInvoices: { $sum: 1 },
      }
    }
  ];

  // Pipeline for payment method breakdown
  const methodPipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$paymentMethod',
        revenue: { $sum: '$finalAmount' },
        count: { $sum: 1 }
      }
    }
  ];

  const [summary, methods] = await Promise.all([
    Invoice.aggregate(pipeline),
    Invoice.aggregate(methodPipeline)
  ]);

  return {
    totalRevenue: summary[0]?.totalRevenue || 0,
    totalInvoices: summary[0]?.totalInvoices || 0,
    paymentMethods: methods.map(m => ({
      method: m._id,
      revenue: m.revenue,
      count: m.count
    }))
  };
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  payInvoice,
  cancelInvoice,
  getRevenueStatistics
};
