const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceCode: { type: String, required: true, unique: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }, // Optional, can be direct walk-in
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  services: [
    {
      service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1, min: 1 }
    }
  ],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'banking', 'momo', 'other'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  note: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Pre-save hook to calculate totalAmount and finalAmount if not provided correctly
invoiceSchema.pre('save', function (next) {
  if (this.services && this.services.length > 0) {
    this.totalAmount = this.services.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
  this.finalAmount = this.totalAmount - (this.discount || 0);
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
