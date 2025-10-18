const mongoose = require('mongoose');
const XLSX = require('xlsx');
const User = require('../models/User');
const Department = require('../models/Department');
const ServiceDetail = require('../models/ServiceDetail');
const Machine = require('../models/Machine');
const Logistic = require('../models/Logistic');

const loadServiceDetailsFromExcel = async () => {
  try {
    console.log('Loading service details from Excel file...');

    // Read the Excel file
    const workbook = XLSX.readFile('./Service Details select.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${jsonData.length} service details in Excel file`);

    // Clear existing service details
    await ServiceDetail.deleteMany({});

    // Process each row
    for (const row of jsonData) {
      // Get the service name (assuming it's in column A or first column)
      const serviceName = row['Service Details'] || row['__EMPTY'] || Object.values(row)[0];

      if (!serviceName || serviceName.trim() === '') continue;

      // Determine category based on keywords
      let category = 'Other';
      const name = serviceName.toLowerCase();

      if (name.includes('crane') || name.includes('كرين')) {
        category = 'Crane Services';
      } else if (name.includes('truck') || name.includes('transport') || name.includes('شاحنة') || name.includes('نقل')) {
        category = 'Transportation';
      } else if (name.includes('labor') || name.includes('worker') || name.includes('عمالة') || name.includes('عامل')) {
        category = 'Labor Services';
      } else if (name.includes('forklift') || name.includes('رافعة شوكية')) {
        category = 'Equipment';
      } else if (name.includes('shovel') || name.includes('معاول')) {
        category = 'Material Handling';
      } else if (name.includes('lift') || name.includes('مصعد')) {
        category = 'Aerial Services';
      } else if (name.includes('trailer') || name.includes('مقطورة')) {
        category = 'Transportation';
      }

      // Create service detail
      const serviceDetail = new ServiceDetail({
        name: serviceName.trim(),
        category: category,
        isActive: true
      });

      await serviceDetail.save();
    }

    console.log('Service details loaded successfully from Excel');
  } catch (error) {
    console.error('Error loading service details from Excel:', error);
  }
};

const seedData = async () => {
  try {
    console.log('Starting data seeding...');

    // Seed departments
    const departments = [
      { name: 'Technology', isDefault: true, isActive: true },
      { name: 'Finance', isDefault: true, isActive: true },
      { name: 'Operations', isDefault: true, isActive: true },
      { name: 'HR', isDefault: true, isActive: true },
      { name: 'Marketing', isDefault: true, isActive: true },
      { name: 'Sales', isDefault: true, isActive: true }
    ];

    for (const dept of departments) {
      await Department.findOneAndUpdate(
        { name: dept.name },
        dept,
        { upsert: true, new: true }
      );
    }

    // Load service details from Excel
    await loadServiceDetailsFromExcel();

    // Seed default admin user
    const adminUser = {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      department: 'Technology',
      isActive: true
    };

    await User.findOneAndUpdate(
      { username: adminUser.username },
      adminUser,
      { upsert: true, new: true }
    );

    // Seed sample machines
    const machines = [
      { name: 'Crane A', type: 'Heavy Crane', capacity: '50 tons', status: 'available' },
      { name: 'Forklift B', type: 'Electric Forklift', capacity: '3 tons', status: 'available' },
      { name: 'Truck C', type: 'Delivery Truck', capacity: '10 tons', status: 'available' }
    ];

    for (const machine of machines) {
      await Machine.findOneAndUpdate(
        { name: machine.name },
        machine,
        { upsert: true, new: true }
      );
    }

    // Seed sample logistics
    const logistics = [
      { name: 'Driver John', type: 'Driver', status: 'available', contact: 'john@asiacell.com' },
      { name: 'Operator Mike', type: 'Equipment Operator', status: 'available', contact: 'mike@asiacell.com' },
      { name: 'Supervisor Sarah', type: 'Supervisor', status: 'available', contact: 'sarah@asiacell.com' }
    ];

    for (const logistic of logistics) {
      await Logistic.findOneAndUpdate(
        { name: logistic.name },
        logistic,
        { upsert: true, new: true }
      );
    }

    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = { seedData, loadServiceDetailsFromExcel };
