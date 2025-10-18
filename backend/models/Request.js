const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  srNumber: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  chiefName: {
    type: String,
    default: 'N/A'
  },
  serviceDetail: {
    type: [String],
    default: []
  },
  details: {
    type: String,
    default: ''
  },
  warehouseOfficerNeeded: {
    type: Boolean,
    default: false
  },
  warehouseOfficer: {
    type: [String],
    default: []
  },
  requestDate: {
    type: Date,
    required: true
  },
  isTransit: {
    type: Boolean,
    default: false
  },
  isResubmitted: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'pending-chief-approval', 'approved', 'rejected', 'in-progress', 'completed', 'sent-back', 'sent-back-from-chief', 'sent-to-requester', 'resubmitted-to-chief'],
    default: 'pending'
  },
  chiefApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sent-back'],
    default: 'pending'
  },
  assignedTo: {
    type: String,
    default: null
  },
  assignedBy: {
    type: String,
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
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Request', requestSchema);
