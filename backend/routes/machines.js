const express = require('express');
const router = express.Router();
const Machine = require('../models/Machine');
const Request = require('../models/Request');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/machines
// @desc    Get all machines
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: machines.length,
      data: machines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/machines/request/:requestId
// @desc    Get machine data by request ID
// @access  Private
router.get('/request/:requestId', protect, async (req, res) => {
  try {
    const machine = await Machine.findOne({ requestId: req.params.requestId });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine data not found'
      });
    }

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/machines/sr/:srNumber
// @desc    Get machine data by SR number
// @access  Private
router.get('/sr/:srNumber', protect, async (req, res) => {
  try {
    const machine = await Machine.findOne({ srNumber: req.params.srNumber });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine data not found'
      });
    }

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/machines
// @desc    Create machine data
// @access  Private (Request Viewer)
router.post('/', protect, authorize('request-viewer', 'admin'), async (req, res) => {
  try {
    const { requestId, srNumber, machines, logisticOfficer, logisticsOfficerNote } = req.body;

    // Check if request exists
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if machine data already exists
    let machine = await Machine.findOne({ requestId });
    if (machine) {
      return res.status(400).json({
        success: false,
        message: 'Machine data already exists for this request'
      });
    }

    // Create machine data
    machine = await Machine.create({
      requestId,
      srNumber,
      machines,
      logisticOfficer: logisticOfficer || req.user.username,
      logisticsOfficerNote,
      status: 'in-progress'
    });

    // Update request status
    request.status = 'in-progress';
    await request.save();

    res.status(201).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/machines/:id
// @desc    Update machine data
// @access  Private (Request Viewer)
router.put('/:id', protect, authorize('request-viewer', 'admin', 'chief', 'store-keeper'), async (req, res) => {
  try {
    let machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine data not found'
      });
    }

    machine = await Machine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/machines/request/:requestId
// @desc    Update machine data by request ID
// @access  Private (Request Viewer)
router.put('/request/:requestId', protect, authorize('request-viewer', 'admin', 'chief', 'store-keeper'), async (req, res) => {
  try {
    let machine = await Machine.findOne({ requestId: req.params.requestId });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine data not found'
      });
    }

    machine = await Machine.findOneAndUpdate(
      { requestId: req.params.requestId },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/machines/:id
// @desc    Delete machine data
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine data not found'
      });
    }

    await machine.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Machine data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/machines/:id/approve-work
// @desc    Approve work completion (Chief)
// @access  Private (Chief only)
router.post('/:id/approve-work', protect, authorize('chief'), async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine data not found'
      });
    }

    machine.status = 'work_approved';
    machine.completeWorkDate = new Date();
    await machine.save();

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/machines/:id/approve-completion
// @desc    Approve completion (Chief)
// @access  Private (Chief only)
router.post('/:id/approve-completion', protect, authorize('chief'), async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine data not found'
      });
    }

    machine.status = 'completion_approved';
    machine.completionApprovedAt = new Date();
    await machine.save();

    res.status(200).json({
      success: true,
      data: machine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
