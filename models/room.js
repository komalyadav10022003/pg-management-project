const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  pg: { type: String, required: true },
  floor: { type: String, required: true },
  room: { type: String, required: true },
  status: { type: String, default: 'Available' },
  guestName: String,
  bookingDate: String,
  totalCharges: Number,
  paymentDone: Number,
  paymentDate: String,
  pendingPayment: Number,
  electricityReading: Number,
  documentsSubmitted: String,
  numGuests: Number,
  gender: String,
  phone: String
});

roomSchema.index({ pg: 1, floor: 1, room: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
