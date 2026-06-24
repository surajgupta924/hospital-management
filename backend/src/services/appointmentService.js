import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import ApiError from '../utils/ApiError.js';
import { APPOINTMENT_STATUS } from '../constants/status.js';
import { getPagination, buildPaginatedResponse, buildSort } from '../utils/pagination.js';
import { logAudit } from './auditService.js';

export const bookAppointment = async (hospitalId, data, bookedBy, req) => {
  const doctor = await Doctor.findOne({ _id: data.doctor, hospital: hospitalId, isAvailable: true });
  if (!doctor) throw new ApiError(404, 'Doctor not found or unavailable');

  const appointmentDate = new Date(data.appointmentDate);
  const conflict = await Appointment.findOne({
    hospital: hospitalId,
    doctor: data.doctor,
    appointmentDate: {
      $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
      $lte: new Date(appointmentDate.setHours(23, 59, 59, 999)),
    },
    startTime: data.startTime,
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED] },
  });

  if (conflict) throw new ApiError(409, 'Time slot already booked');

  const appointment = await Appointment.create({
    ...data,
    hospital: hospitalId,
    appointmentDate: new Date(data.appointmentDate),
    bookedBy: bookedBy._id,
  });

  await logAudit({
    hospital: hospitalId,
    user: bookedBy,
    action: 'CREATE',
    resource: 'Appointment',
    resourceId: appointment._id,
    req,
  });

  return Appointment.findById(appointment._id)
    .populate('patient', 'firstName lastName patientId phone')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } });
};

export const getAppointments = async (hospitalId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { hospital: hospitalId };

  if (query.status) filter.status = query.status;
  if (query.doctor) filter.doctor = query.doctor;
  if (query.patient) filter.patient = query.patient;
  if (query.date) {
    const date = new Date(query.date);
    filter.appointmentDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lte: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patient', 'firstName lastName patientId phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .sort(buildSort(query.sortBy || 'appointmentDate', query.order || 'asc'))
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(filter),
  ]);

  return buildPaginatedResponse(appointments, total, page, limit);
};

export const getAppointmentById = async (hospitalId, id) => {
  const appointment = await Appointment.findOne({ _id: id, hospital: hospitalId })
    .populate('patient')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } });
  if (!appointment) throw new ApiError(404, 'Appointment not found');
  return appointment;
};

export const rescheduleAppointment = async (hospitalId, id, data, user, req) => {
  const appointment = await Appointment.findOne({ _id: id, hospital: hospitalId });
  if (!appointment) throw new ApiError(404, 'Appointment not found');

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    throw new ApiError(400, 'Cannot reschedule cancelled appointment');
  }

  Object.assign(appointment, {
    appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : appointment.appointmentDate,
    startTime: data.startTime || appointment.startTime,
    endTime: data.endTime || appointment.endTime,
    status: APPOINTMENT_STATUS.SCHEDULED,
  });
  await appointment.save();

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'Appointment',
    resourceId: appointment._id,
    details: { action: 'reschedule', ...data },
    req,
  });

  return getAppointmentById(hospitalId, id);
};

export const cancelAppointment = async (hospitalId, id, reason, user, req) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: id, hospital: hospitalId },
    {
      status: APPOINTMENT_STATUS.CANCELLED,
      cancellationReason: reason,
      cancelledBy: user._id,
    },
    { new: true }
  );

  if (!appointment) throw new ApiError(404, 'Appointment not found');

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'Appointment',
    resourceId: appointment._id,
    details: { action: 'cancel', reason },
    req,
  });

  return appointment;
};

export const updateAppointmentStatus = async (hospitalId, id, status, user, req) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: id, hospital: hospitalId },
    { status },
    { new: true }
  );

  if (!appointment) throw new ApiError(404, 'Appointment not found');

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'Appointment',
    resourceId: appointment._id,
    details: { status },
    req,
  });

  return appointment;
};

export const getDoctorAvailability = async (hospitalId, doctorId, date) => {
  const doctor = await Doctor.findOne({ _id: doctorId, hospital: hospitalId });
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay();

  const daySchedule = doctor.schedule.filter((s) => s.dayOfWeek === dayOfWeek && s.isAvailable);

  const booked = await Appointment.find({
    hospital: hospitalId,
    doctor: doctorId,
    appointmentDate: {
      $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
      $lte: new Date(targetDate.setHours(23, 59, 59, 999)),
    },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED] },
  }).select('startTime endTime status');

  return { schedule: daySchedule, bookedSlots: booked };
};
