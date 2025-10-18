const express = require('express');
const router = express.Router();
const ServiceDetail = require('../models/ServiceDetail');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/service-details
// @desc    Get all service details
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { isActive, category } = req.query;
    
    let query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (category) query.category = category;

    const serviceDetails = await ServiceDetail.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: serviceDetails.length,
      data: serviceDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/service-details/:id
// @desc    Get single service detail
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const serviceDetail = await ServiceDetail.findById(req.params.id);

    if (!serviceDetail) {
      return res.status(404).json({
        success: false,
        message: 'Service detail not found'
      });
    }

    res.status(200).json({
      success: true,
      data: serviceDetail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/service-details
// @desc    Create new service detail
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, category } = req.body;

    const serviceDetail = await ServiceDetail.create({
      name,
      category: category || 'General'
    });

    res.status(201).json({
      success: true,
      data: serviceDetail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/service-details/bulk
// @desc    Create multiple service details
// @access  Private (Admin only)
router.post('/bulk', protect, authorize('admin'), async (req, res) => {
  try {
    const { serviceDetails } = req.body;

    if (!Array.isArray(serviceDetails) || serviceDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of service details'
      });
    }

    const createdDetails = await ServiceDetail.insertMany(serviceDetails);

    res.status(201).json({
      success: true,
      count: createdDetails.length,
      data: createdDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/service-details/:id
// @desc    Update service detail
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let serviceDetail = await ServiceDetail.findById(req.params.id);

    if (!serviceDetail) {
      return res.status(404).json({
        success: false,
        message: 'Service detail not found'
      });
    }

    serviceDetail = await ServiceDetail.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: serviceDetail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/service-details/:id
// @desc    Delete service detail
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const serviceDetail = await ServiceDetail.findById(req.params.id);

    if (!serviceDetail) {
      return res.status(404).json({
        success: false,
        message: 'Service detail not found'
      });
    }

    await serviceDetail.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service detail deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
