const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  birthDate: { type: Date },
  address: { type: String },
  totalVisits: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastVisit: { type: Date },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
