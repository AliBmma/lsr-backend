const connectDB = require('./config/database');
const { seedData } = require('./utils/seedData');

module.exports = async (req, res) => {
  try {
    // Connect to database
    await connectDB();

    // Run seeding
    await seedData();

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully!'
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      message: 'Seeding failed: ' + error.message
    });
  }
};
