const mongoose = require('mongoose');

const machineItemSchema = new mongoose.Schema({
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

const machineSchema = new mongoose.Schema({
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
    type: [machineItemSchema],
    default: []
  },
  logisticOfficer: {
    type: String,
    default: ''
  },
  logisticsOfficerNote: {
    type: String,
    default: ''
  },
  requesterNote: {
    type: String,
    default: ''
  },
  chiefNote: {
    type: String,
    default: ''
  },
  storeKeeperNote: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'work_approved', 'completion_approved', 'sent-back', 'sent-to-requester', 'sent-back-from-chief', 'sent-back-to-requester', 'sent-back-to-viewer', 'resubmitted-to-chief', 'completed'],
    default: 'pending'
  },
  completeWorkDate: {
    type: Date,
    default: null
  },
  completionApprovedAt: {
    type: Date,
    default: null
  },
  sentBackBy: {
    type: String,
    default: ''
  },
  sentBackDate: {
    type: Date,
    default: null
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
machineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Machine', machineSchema);
