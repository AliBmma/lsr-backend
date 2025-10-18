const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Machine = require('../models/Machine');
const Logistic = require('../models/Logistic');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/requests
// @desc    Get all requests (with filters)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, requesterName, department, assignedTo, chiefName, fromDate, toDate, search } = req.query;
    
    let query = {};

    // Apply filters
    if (status) query.status = status;
    if (requesterName) query.requesterName = requesterName;
    if (department) query.department = department;
    if (assignedTo) query.assignedTo = assignedTo;
    if (chiefName) query.chiefName = chiefName;
    
    // Date range filter
    if (fromDate || toDate) {
      query.requestDate = {};
      if (fromDate) query.requestDate.$gte = new Date(fromDate);
      if (toDate) query.requestDate.$lte = new Date(toDate);
    }

    // Search by SR number
    if (search) {
      query.srNumber = { $regex: search, $options: 'i' };
    }

    // Role-based filtering
    if (req.user.role === 'requester') {
      query.requesterName = req.user.username;
    } else if (req.user.role === 'chief') {
      query.chiefName = req.user.username;
    } else if (req.user.role === 'request-viewer') {
      query.assignedTo = req.user.username;
    }

    const requests = await Request.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/requests/:id
// @desc    Get single request by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Get associated machine and logistic data
    const machine = await Machine.findOne({ requestId: request._id });
    const logistic = await Logistic.findOne({ requestId: request._id });

    res.status(200).json({
      success: true,
      data: {
        request,
        machine,
        logistic
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/requests/sr/:srNumber
// @desc    Get request by SR number
// @access  Private
router.get('/sr/:srNumber', protect, async (req, res) => {
  try {
    const request = await Request.findOne({ srNumber: req.params.srNumber });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Get associated machine and logistic data
    const machine = await Machine.findOne({ requestId: request._id });
    const logistic = await Logistic.findOne({ requestId: request._id });

    res.status(200).json({
      success: true,
      data: {
        request,
        machine,
        logistic
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/requests
// @desc    Create new request
// @access  Private (Requester, Request-Viewer)
router.post('/', protect, authorize('requester', 'request-viewer'), async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      requesterName: req.user.username
    };

    // Set initial status based on request type
    if (requestData.isTransit) {
      requestData.status = 'pending';
    } else {
      requestData.status = 'pending-chief-approval';
    }

    const request = await Request.create(requestData);

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/requests/:id
// @desc    Update request
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization
    if (req.user.role === 'requester' && request.requesterName !== req.user.username) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    request = await Request.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete request
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Delete associated machine and logistic data
    await Machine.deleteOne({ requestId: request._id });
    await Logistic.deleteOne({ requestId: request._id });

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/requests/:id/approve
// @desc    Approve request (Chief)
// @access  Private (Chief only)
router.post('/:id/approve', protect, authorize('chief'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if chief is authorized for this request
    if (request.chiefName !== req.user.username) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this request'
      });
    }

    request.chiefApprovalStatus = 'approved';
    request.status = 'approved';
    await request.save();

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/requests/:id/reject
// @desc    Reject request (Chief)
// @access  Private (Chief only)
router.post('/:id/reject', protect, authorize('chief'), async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if chief is authorized for this request
    if (request.chiefName !== req.user.username) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }

    request.chiefApprovalStatus = 'rejected';
    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/requests/:id/send-back
// @desc    Send request back to requester (Chief)
// @access  Private (Chief only)
router.post('/:id/send-back', protect, authorize('chief', 'logistic-control'), async (req, res) => {
  try {
    const { note } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    request.status = 'sent-back-from-chief';
    await request.save();

    // Create or update machine data with note
    let machine = await Machine.findOne({ requestId: request._id });
    if (!machine) {
      machine = new Machine({
        requestId: request._id,
        srNumber: request.srNumber
      });
    }

    if (req.user.role === 'chief') {
      machine.chiefNote = note;
      machine.status = 'sent-back-from-chief';
    } else if (req.user.role === 'logistic-control') {
      machine.requesterNote = note;
      machine.status = 'sent-to-requester';
      machine.sentBackBy = 'logistic-control';
      machine.sentBackDate = new Date();
    }

    await machine.save();

    res.status(200).json({
      success: true,
      data: { request, machine }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/requests/:id/assign
// @desc    Assign request to viewer (Logistic Control)
// @access  Private (Logistic Control only)
router.post('/:id/assign', protect, authorize('logistic-control'), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    request.assignedTo = assignedTo;
    request.assignedBy = req.user.username;
    request.status = 'in-progress';
    await request.save();

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
