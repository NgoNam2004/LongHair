const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  speciality: { type: String },
  rating: { type: Number, default: 5.0 },
  totalServices: { type: Number, default: 0 },
  salary: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  workDays: [{ type: Number }], // 0 (Sunday) to 6 (Saturday)
  joinDate: { type: Date, default: Date.now },
  avatar: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
