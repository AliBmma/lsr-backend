const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Logistic = require('../models/Logistic');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin, Supervisor)
router.get('/dashboard', protect, authorize('admin', 'supervisor', 'logistic-control'), async (req, res) => {
  try {
    // Total requests
    const totalRequests = await Request.countDocuments();

    // Pending requests
    const pendingRequests = await Request.countDocuments({
      status: { $in: ['pending', 'pending-chief-approval'] }
    });

    // In progress requests
    const inProgressRequests = await Request.countDocuments({
      status: 'in-progress'
    });

    // Completed requests
    const completedRequests = await Request.countDocuments({
      status: 'completed'
    });

    // Calculate total value from logistics
    const logistics = await Logistic.find();
    const totalValue = logistics.reduce((sum, logistic) => sum + (logistic.totalPrice || 0), 0);

    // Requests by department
    const requestsByDepartment = await Request.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Requests by status
    const requestsByStatus = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent requests (last 10)
    const recentRequests = await Request.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('srNumber requesterName department status requestDate');

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRequests,
          pendingRequests,
          inProgressRequests,
          completedRequests,
          totalValue
        },
        requestsByDepartment,
        requestsByStatus,
        recentRequests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/stats/user/:username
// @desc    Get user-specific statistics
// @access  Private
router.get('/user/:username', protect, async (req, res) => {
  try {
    const username = req.params.username;

    // Check authorization - users can only view their own stats unless admin
    if (req.user.username !== username && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these statistics'
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let stats = {};

    if (user.role === 'requester') {
      // Requester statistics
      const totalRequests = await Request.countDocuments({ requesterName: username });
      const pendingRequests = await Request.countDocuments({
        requesterName: username,
        status: { $in: ['pending', 'pending-chief-approval'] }
      });
      const completedRequests = await Request.countDocuments({
        requesterName: username,
        status: 'completed'
      });

      stats = {
        totalRequests,
        pendingRequests,
        completedRequests
      };
    } else if (user.role === 'chief') {
      // Chief statistics
      const totalRequests = await Request.countDocuments({ chiefName: username });
      const pendingApproval = await Request.countDocuments({
        chiefName: username,
        status: 'pending-chief-approval'
      });
      const approved = await Request.countDocuments({
        chiefName: username,
        chiefApprovalStatus: 'approved'
      });
      const rejected = await Request.countDocuments({
        chiefName: username,
        chiefApprovalStatus: 'rejected'
      });

      stats = {
        totalRequests,
        pendingApproval,
        approved,
        rejected
      };
    } else if (user.role === 'request-viewer') {
      // Request viewer statistics
      const assignedRequests = await Request.countDocuments({ assignedTo: username });
      const completedRequests = await Logistic.countDocuments({ logisticOfficer: username });

      stats = {
        assignedRequests,
        completedRequests
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/stats/reports
// @desc    Get detailed reports with date range
// @access  Private (Admin, Supervisor)
router.get('/reports', protect, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const { fromDate, toDate, department, status } = req.query;

    let query = {};

    // Date range filter
    if (fromDate || toDate) {
      query.requestDate = {};
      if (fromDate) query.requestDate.$gte = new Date(fromDate);
      if (toDate) query.requestDate.$lte = new Date(toDate);
    }

    if (department) query.department = department;
    if (status) query.status = status;

    const requests = await Request.find(query).sort({ requestDate: -1 });

    // Get logistics for completed requests
    const requestIds = requests.map(r => r._id);
    const logistics = await Logistic.find({ requestId: { $in: requestIds } });

    // Calculate totals
    const totalValue = logistics.reduce((sum, logistic) => sum + (logistic.totalPrice || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        requests,
        logistics,
        summary: {
          totalRequests: requests.length,
          totalValue,
          completedRequests: logistics.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
