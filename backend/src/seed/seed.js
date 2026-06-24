import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';
import { ROLES } from '../constants/roles.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hms_saas');
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      Department.deleteMany({}),
      Doctor.deleteMany({}),
    ]);

    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@hms.com',
      password: 'Admin@12345',
      role: ROLES.SUPER_ADMIN,
    });

    const hospital = await Hospital.create({
      name: 'City General Hospital',
      slug: 'city-general',
      email: 'admin@citygeneral.com',
      phone: '+1-555-0100',
      address: { street: '123 Health Ave', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
      createdBy: superAdmin._id,
    });

    const hospitalAdmin = await User.create({
      firstName: 'John',
      lastName: 'Admin',
      email: 'admin@citygeneral.com',
      password: 'Admin@12345',
      phone: '+1-555-0101',
      role: ROLES.HOSPITAL_ADMIN,
      hospital: hospital._id,
    });

    const dept = await Department.create({
      hospital: hospital._id,
      name: 'General Medicine',
      description: 'General medicine and primary care',
    });

    const doctorUser = await User.create({
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'doctor@citygeneral.com',
      password: 'Admin@12345',
      phone: '+1-555-0102',
      role: ROLES.DOCTOR,
      hospital: hospital._id,
    });

    await Doctor.create({
      hospital: hospital._id,
      user: doctorUser._id,
      department: dept._id,
      specialization: 'General Medicine',
      qualification: 'MD',
      consultationFee: 150,
      schedule: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
      ],
    });

    await User.create({
      firstName: 'Emily',
      lastName: 'Reception',
      email: 'reception@citygeneral.com',
      password: 'Admin@12345',
      role: ROLES.RECEPTIONIST,
      hospital: hospital._id,
    });

    console.log('\n✅ Seed data created successfully!\n');
    console.log('Login credentials (password: Admin@12345):');
    console.log('  Super Admin:  superadmin@hms.com');
    console.log('  Hospital Admin: admin@citygeneral.com');
    console.log('  Doctor:       doctor@citygeneral.com');
    console.log('  Receptionist: reception@citygeneral.com\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
