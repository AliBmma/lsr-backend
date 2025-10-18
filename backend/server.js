const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/machines', require('./routes/machines'));
app.use('/api/logistics', require('./routes/logistics'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/service-details', require('./routes/serviceDetails'));
app.use('/api/stats', require('./routes/stats'));

// Seed route (temporary)
app.post('/api/seed-once', require('./seed-once'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LSR Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Asiacell LSR Service API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      requests: '/api/requests',
      machines: '/api/machines',
      logistics: '/api/logistics',
      departments: '/api/departments',
      serviceDetails: '/api/service-details',
      stats: '/api/stats',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

// For Vercel serverless functions
module.exports = (req, res) => {
  return app(req, res);
};

// For local development
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 LSR Backend Server Running                          ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Port: ${PORT}                                              ║
║   Database: MongoDB                                       ║
║                                                           ║
║   API Endpoints:                                          ║
║   • http://localhost:${PORT}/api/auth                        ║
║   • http://localhost:${PORT}/api/users                       ║
║   • http://localhost:${PORT}/api/requests                    ║
║   • http://localhost:${PORT}/api/machines                    ║
║   • http://localhost:${PORT}/api/logistics                   ║
║   • http://localhost:${PORT}/api/departments                 ║
║   • http://localhost:${PORT}/api/service-details             ║
║   • http://localhost:${PORT}/api/stats                       ║
║                                                           ║
║   Health Check: http://localhost:${PORT}/api/health          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
  });
}
