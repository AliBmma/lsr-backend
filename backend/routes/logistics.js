const express = require('express');
const router = express.Router();
const Logistic = require('../models/Logistic');
const Request = require('../models/Request');
const Machine = require('../models/Machine');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/logistics
// @desc    Get all logistics
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const logistics = await Logistic.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logistics.length,
      data: logistics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/logistics/request/:requestId
// @desc    Get logistic data by request ID
// @access  Private
router.get('/request/:requestId', protect, async (req, res) => {
  try {
    const logistic = await Logistic.findOne({ requestId: req.params.requestId });

    if (!logistic) {
      return res.status(404).json({
        success: false,
        message: 'Logistic data not found'
      });
    }

    res.status(200).json({
      success: true,
      data: logistic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/logistics/sr/:srNumber
// @desc    Get logistic data by SR number
// @access  Private
router.get('/sr/:srNumber', protect, async (req, res) => {
  try {
    const logistic = await Logistic.findOne({ srNumber: req.params.srNumber });

    if (!logistic) {
      return res.status(404).json({
        success: false,
        message: 'Logistic data not found'
      });
    }

    res.status(200).json({
      success: true,
      data: logistic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/logistics
// @desc    Create logistic data (finalize request)
// @access  Private (Request Viewer, Supervisor)
router.post('/', protect, authorize('request-viewer', 'supervisor', 'admin'), async (req, res) => {
  try {
    const { requestId, srNumber, machines, totalPrice, completeWorkDate, requesterNote } = req.body;

    // Check if request exists
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if logistic data already exists
    let logistic = await Logistic.findOne({ requestId });
    if (logistic) {
      return res.status(400).json({
        success: false,
        message: 'Logistic data already exists for this request'
      });
    }

    // Create logistic data
    logistic = await Logistic.create({
      requestId,
      srNumber,
      machines,
      logisticOfficer: req.user.username,
      totalPrice,
      completeWorkDate,
      requesterNote,
      status: 'completed'
    });

    // Update request status
    request.status = 'completed';
    await request.save();

    // Update machine status
    const machine = await Machine.findOne({ requestId });
    if (machine) {
      machine.status = 'completed';
      await machine.save();
    }

    res.status(201).json({
      success: true,
      data: logistic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/logistics/:id
// @desc    Update logistic data
// @access  Private (Request Viewer, Supervisor, Admin)
router.put('/:id', protect, authorize('request-viewer', 'supervisor', 'admin'), async (req, res) => {
  try {
    let logistic = await Logistic.findById(req.params.id);

    if (!logistic) {
      return res.status(404).json({
        success: false,
        message: 'Logistic data not found'
      });
    }

    logistic = await Logistic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: logistic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/logistics/request/:requestId
// @desc    Update logistic data by request ID
// @access  Private (Request Viewer, Supervisor, Admin)
router.put('/request/:requestId', protect, authorize('request-viewer', 'supervisor', 'admin'), async (req, res) => {
  try {
    let logistic = await Logistic.findOne({ requestId: req.params.requestId });

    if (!logistic) {
      return res.status(404).json({
        success: false,
        message: 'Logistic data not found'
      });
    }

    logistic = await Logistic.findOneAndUpdate(
      { requestId: req.params.requestId },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: logistic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/logistics/:id
// @desc    Delete logistic data
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const logistic = await Logistic.findById(req.params.id);

    if (!logistic) {
      return res.status(404).json({
        success: false,
        message: 'Logistic data not found'
      });
    }

    await logistic.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Logistic data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
