const mongoose = require('mongoose');

const logisticItemSchema = new mongoose.Schema({
  machine: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true,
    default: 1
  },
  days: {
    type: Number,
    required: true,
    default: 1
  },
  location: {
    type: String,
    default: ''
  },
  workType: {
    type: String,
    default: ''
  },
  basePrice: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  }
});

const logisticSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  srNumber: {
    type: String,
    required: true
  },
  machines: {
    type: [logisticItemSchema],
    default: []
  },
  logisticOfficer: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  completeWorkDate: {
    type: Date,
    required: true
  },
  requesterNote: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
logisticSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Logistic', logisticSchema);
