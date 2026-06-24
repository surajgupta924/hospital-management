import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Invoice from '../models/Invoice.js';
import AuditLog from '../models/AuditLog.js';
import { APPOINTMENT_STATUS, PAYMENT_STATUS } from '../constants/status.js';

export const getDashboardStats = async (hospitalId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalPatients,
    totalDoctors,
    todayAppointments,
    pendingInvoices,
    revenueData,
    recentActivities,
  ] = await Promise.all([
    Patient.countDocuments({ hospital: hospitalId, isActive: true }),
    Doctor.countDocuments({ hospital: hospitalId, isAvailable: true }),
    Appointment.countDocuments({
      hospital: hospitalId,
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: { $ne: APPOINTMENT_STATUS.CANCELLED },
    }),
    Invoice.countDocuments({ hospital: hospitalId, paymentStatus: PAYMENT_STATUS.PENDING }),
    Invoice.aggregate([
      {
        $match: {
          hospital: hospitalId,
          paymentStatus: PAYMENT_STATUS.PAID,
          paidAt: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) },
        },
      },
      { $group: { _id: null, revenue: { $sum: '$total' } } },
    ]),
    AuditLog.find({ hospital: hospitalId })
      .populate('user', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  return {
    totalPatients,
    totalDoctors,
    todayAppointments,
    pendingInvoices,
    monthlyRevenue: revenueData[0]?.revenue || 0,
    recentActivities,
  };
};

export const getAppointmentChart = async (hospitalId, days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return Appointment.aggregate([
    {
      $match: {
        hospital: hospitalId,
        appointmentDate: { $gte: startDate },
        status: { $ne: APPOINTMENT_STATUS.CANCELLED },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

export const getRevenueChart = async (hospitalId, months = 6) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return Invoice.aggregate([
    {
      $match: {
        hospital: hospitalId,
        paymentStatus: PAYMENT_STATUS.PAID,
        paidAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        revenue: { $sum: '$total' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

export const getSuperAdminStats = async () => {
  const Hospital = (await import('../models/Hospital.js')).default;
  const User = (await import('../models/User.js')).default;

  const [totalHospitals, activeHospitals, totalUsers] = await Promise.all([
    Hospital.countDocuments(),
    Hospital.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
  ]);

  return { totalHospitals, activeHospitals, totalUsers };
};
