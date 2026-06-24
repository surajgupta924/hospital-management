import Notification from '../models/Notification.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import { NOTIFICATION_TYPES, APPOINTMENT_STATUS } from '../constants/status.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

export const createNotification = async (data) => {
  return Notification.create(data);
};

export const getUserNotifications = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { user: userId };
  if (query.isRead !== undefined) filter.isRead = query.isRead === 'true';

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  return buildPaginatedResponse(notifications, total, page, limit);
};

export const markAsRead = async (userId, notificationId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true, readAt: new Date() });
  return { message: 'All notifications marked as read' };
};

export const sendAppointmentReminders = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const appointments = await Appointment.find({
    appointmentDate: { $gte: tomorrow, $lt: dayAfter },
    status: { $in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED] },
    reminderSent: false,
  }).populate('patient');

  for (const apt of appointments) {
    if (apt.patient?.user) {
      await createNotification({
        hospital: apt.hospital,
        user: apt.patient.user,
        type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
        title: 'Appointment Reminder',
        message: `You have an appointment scheduled for tomorrow at ${apt.startTime}`,
        data: { appointmentId: apt._id },
      });
    }
    apt.reminderSent = true;
    await apt.save();
  }

  return { sent: appointments.length };
};

export const sendPrescriptionReminders = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const prescriptions = await Prescription.find({
    followUpDate: { $gte: today, $lt: tomorrow },
    reminderSent: false,
    isActive: true,
  }).populate('patient');

  for (const rx of prescriptions) {
    if (rx.patient?.user) {
      await createNotification({
        hospital: rx.hospital,
        user: rx.patient.user,
        type: NOTIFICATION_TYPES.PRESCRIPTION_REMINDER,
        title: 'Follow-up Reminder',
        message: 'You have a follow-up appointment scheduled for tomorrow',
        data: { prescriptionId: rx._id },
      });
    }
    rx.reminderSent = true;
    await rx.save();
  }

  return { sent: prescriptions.length };
};
