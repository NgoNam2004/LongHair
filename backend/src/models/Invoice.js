const mongoose = require('mongoose');

/**
 * Hóa đơn lưu theo dạng "snapshot": tên khách, tên thợ, tên dịch vụ và giá
 * được lưu thẳng vào hóa đơn (giá/tên có đổi sau này thì hóa đơn cũ không bị đổi).
 * Các trường tham chiếu (customer, staff, services.service) là TÙY CHỌN,
 * sẽ dùng khi có API Customer/Staff/Service.
 */
const invoiceSchema = new mongoose.Schema(
  {
    invoiceCode: { type: String, required: true, unique: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },

    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, required: [true, 'Customer name is required'], trim: true },

    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    staffName: { type: String, trim: true, default: '' },

    services: [
      {
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        name: { type: String, required: [true, 'Service name is required'], trim: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, default: 1, min: 1 },
        _id: false,
      },
    ],

    totalAmount: { type: Number, default: 0 }, // tạm tính (tự tính)
    discount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, default: 0 }, // tổng cộng (tự tính)

    paymentMethod: { type: String, enum: ['cash', 'transfer', 'momo', 'other'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
    paidAt: { type: Date },

    note: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ paymentStatus: 1 });

// Tự tính tiền TRƯỚC khi validate -> không tin số tiền client gửi lên
invoiceSchema.pre('validate', function (next) {
  const total = (this.services || []).reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  this.totalAmount = total;

  if ((this.discount || 0) > total) {
    this.invalidate('discount', 'Discount cannot be greater than the total amount');
  }
  this.finalAmount = Math.max(total - (this.discount || 0), 0);

  if (this.paymentStatus === 'paid' && !this.paidAt) {
    this.paidAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);