const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Department = require('../models/Department');
const ServiceDetail = require('../models/ServiceDetail');

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Default users from the original system
const defaultUsers = [
  { username: 'zaid.nihad', password: 'scmasiacell', role: 'requester' },
  { username: 'laith.talib', password: 'scmasiacell', role: 'request-viewer' },
  { username: 'mustafa.ismael', password: 'scmasiacell', role: 'request-viewer' },
  { username: 'mustafa.munaf', password: 'scmasiacell', role: 'request-viewer' },
  { username: 'abdulrahman.mazin', password: 'scmasiacell', role: 'request-viewer' },
  { username: 'yasir.fri', password: 'scmasiacell', role: 'request-viewer' },
  { username: 'ali.basil', password: 'scmasiacell', role: 'supervisor' },
  { username: 'sarbast.nadhmi', password: 'scmasiacell', role: 'logistic-control' },
  { username: 'mahmood.saed', password: 'scmasiacell', role: 'admin' },
  { username: 'mohammed.radhwan', password: 'scmasiacell', role: 'chief' },
  { username: 'haider.kareem', password: 'scmasiacell', role: 'store-keeper' },
  { username: 'store.keeper.officer', password: 'scmasiacell', role: 'store-keeper-officer' }
];

// Default departments
const defaultDepartments = [
  { name: 'Technology', isDefault: true },
  { name: 'Finance', isDefault: true },
  { name: 'Operations', isDefault: true },
  { name: 'HR', isDefault: true },
  { name: 'Marketing', isDefault: true },
  { name: 'Sales', isDefault: true }
];

// Sample service details
const sampleServiceDetails = [
  { name: 'Equipment Installation', category: 'Installation' },
  { name: 'Equipment Maintenance', category: 'Maintenance' },
  { name: 'Equipment Repair', category: 'Repair' },
  { name: 'Site Survey', category: 'Survey' },
  { name: 'Network Configuration', category: 'Configuration' },
  { name: 'Cable Installation', category: 'Installation' },
  { name: 'Tower Maintenance', category: 'Maintenance' },
  { name: 'Generator Service', category: 'Maintenance' },
  { name: 'AC Unit Service', category: 'Maintenance' },
  { name: 'Security System Installation', category: 'Installation' }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await ServiceDetail.deleteMany({});
    console.log('✓ Existing data cleared\n');

    // Seed users
    console.log('Seeding users...');
    for (const userData of defaultUsers) {
      await User.create(userData);
      console.log(`✓ Created user: ${userData.username} (${userData.role})`);
    }
    console.log(`\n✓ ${defaultUsers.length} users created\n`);

    // Seed departments
    console.log('Seeding departments...');
    for (const deptData of defaultDepartments) {
      await Department.create(deptData);
      console.log(`✓ Created department: ${deptData.name}`);
    }
    console.log(`\n✓ ${defaultDepartments.length} departments created\n`);

    // Seed service details
    console.log('Seeding service details...');
    for (const serviceData of sampleServiceDetails) {
      await ServiceDetail.create(serviceData);
      console.log(`✓ Created service detail: ${serviceData.name}`);
    }
    console.log(`\n✓ ${sampleServiceDetails.length} service details created\n`);

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║   ✅ Database seeding completed successfully!            ║');
    console.log('║                                                           ║');
    console.log('║   Default Admin Credentials:                             ║');
    console.log('║   Username: mahmood.saed                                  ║');
    console.log('║   Password: scmasiacell                                   ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
