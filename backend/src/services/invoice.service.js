const Invoice = require('../models/Invoice');
const ApiError = require('../utils/ApiError');

// Đăng ký model để populate() ở getInvoiceById hoạt động
// (model nào chưa được require thì Mongoose báo MissingSchemaError)
require('../models/Customer');
require('../models/Staff');
require('../models/Service');
require('../models/Appointment');
require('../models/User');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Mã hóa đơn: HD + YYYYMMDD (giờ local của server) + số thứ tự 3 chữ số
const generateInvoiceCode = async () => {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const prefix = `HD${dateStr}`;

  const latest = await Invoice.findOne({ invoiceCode: new RegExp(`^${prefix}`) }).sort({ invoiceCode: -1 });

  let sequence = 1;
  if (latest) {
    sequence = parseInt(latest.invoiceCode.substring(prefix.length), 10) + 1;
  }
  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

const createInvoice = async (data, userId) => {
  // Chỉ nhận các trường cho phép (không cho client tự gán finalAmount, createdBy...)
  const {
    customer, customerName, staff, staffName, appointment,
    services, discount, paymentMethod, paymentStatus, note,
  } = data;

  const invoice = new Invoice({
    customer, customerName, staff, staffName, appointment,
    services, discount, paymentMethod, paymentStatus, note,
    createdBy: userId,
  });

  // Thử lại nếu 2 request cùng lúc sinh trùng mã
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      invoice.invoiceCode = await generateInvoiceCode();
      await invoice.save();
      return invoice;
    } catch (err) {
      const isDupCode = err.code === 11000 && err.keyPattern && err.keyPattern.invoiceCode;
      if (!isDupCode || attempt === 2) throw err;
    }
  }
};

const getInvoices = async (query) => {
  const { page, limit, startDate, endDate, paymentStatus, staffId, customerId, search } = query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const filter = {};
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (staffId) filter.staff = staffId;
  if (customerId) filter.customer = customerId;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (search && search.trim()) {
    const re = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ invoiceCode: re }, { customerName: re }, { staffName: re }];
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Invoice.countDocuments(filter),
  ]);

  return {
    invoices,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  };
};

const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id)
    .populate('customer', 'name phone email gender')
    .populate('staff', 'name phone speciality')
    .populate('services.service', 'name category duration')
    .populate('appointment', 'date time status')
    .populate('createdBy', 'name username');

  if (!invoice) throw new ApiError(404, 'Invoice not found');
  return invoice;
};

const updateInvoice = async (id, data) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  if (invoice.paymentStatus !== 'pending') {
    throw new ApiError(400, 'Only pending invoices can be updated');
  }

  // Chỉ cho sửa các trường này
  const editable = ['customerName', 'staffName', 'services', 'discount', 'paymentMethod', 'note'];
  editable.forEach((key) => {
    if (data[key] !== undefined) invoice[key] = data[key];
  });

  await invoice.save();
  return invoice;
};

const payInvoice = async (id) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  if (invoice.paymentStatus === 'paid') throw new ApiError(400, 'Invoice is already paid');
  if (invoice.paymentStatus === 'cancelled') throw new ApiError(400, 'Cannot pay a cancelled invoice');

  invoice.paymentStatus = 'paid';
  invoice.paidAt = new Date();
  await invoice.save();
  return invoice;
};

const cancelInvoice = async (id) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  if (invoice.paymentStatus === 'paid') throw new ApiError(400, 'Cannot cancel a paid invoice');

  invoice.paymentStatus = 'cancelled';
  await invoice.save();
  return invoice;
};

const getRevenueStatistics = async () => {
  const [byStatus, methods] = await Promise.all([
    Invoice.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
    ]),
    Invoice.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$paymentMethod', revenue: { $sum: '$finalAmount' }, count: { $sum: 1 } } },
    ]),
  ]);

  const pick = (status) => byStatus.find((s) => s._id === status) || { count: 0, revenue: 0 };

  return {
    totalRevenue: pick('paid').revenue, // chỉ tính hóa đơn đã thanh toán
    paidCount: pick('paid').count,
    pendingCount: pick('pending').count,
    cancelledCount: pick('cancelled').count,
    totalInvoices: byStatus.reduce((sum, s) => sum + s.count, 0),
    paymentMethods: methods.map((m) => ({ method: m._id, revenue: m.revenue, count: m.count })),
  };
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  payInvoice,
  cancelInvoice,
  getRevenueStatistics,
};