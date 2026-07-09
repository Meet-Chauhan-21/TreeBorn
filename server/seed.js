require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in your env configuration.');
      process.exit(1);
    }

    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database.');

    const adminEmail = 'admin@treeborn.com';
    const adminPassword = 'treeborn@123';

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log(`Admin user with email "${adminEmail}" already exists in the database.`);
    } else {
      console.log('Seeding admin user...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const adminUser = new User({
        name: 'TreeBorn Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '+919999999999',
        role: 'admin'
      });

      await adminUser.save();
      console.log('Admin user seeded successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from database. Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error occurred:', error);
    process.exit(1);
  }
};

seedAdmin();
