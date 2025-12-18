const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  inTime: {
    type: String,
    required: true
  },
  outTime: {
    type: String,
    required: true
  },
  originalInTime: {
    type: String
  },
  originalOutTime: {
    type: String
  },
  presentHours: {
    type: Number,
    required: true
  },
  otHours: {
    type: Number,
    required: true
  },
  presentAmount: {
    type: Number,
    required: true
  },
  otAmount: {
    type: Number,
    required: true
  },
  pf: {
    type: Number,
    required: true
  },
  usedDailySalaryRate: {
    type: Number,
    required: true
  },
  dailySalary: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Entry', entrySchema);
