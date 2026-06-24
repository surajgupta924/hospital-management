import * as appointmentService from '../services/appointmentService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const bookAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.bookAppointment(req.hospitalId, req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, appointment, 'Appointment booked'));
});

export const getAppointments = asyncHandler(async (req, res) => {
  const result = await appointmentService.getAppointments(req.hospitalId, req.query);
  res.json(new ApiResponse(200, result));
});

export const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.hospitalId, req.params.id);
  res.json(new ApiResponse(200, appointment));
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.rescheduleAppointment(req.hospitalId, req.params.id, req.body, req.user, req);
  res.json(new ApiResponse(200, appointment, 'Appointment rescheduled'));
});

export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.cancelAppointment(req.hospitalId, req.params.id, req.body.reason, req.user, req);
  res.json(new ApiResponse(200, appointment, 'Appointment cancelled'));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.updateAppointmentStatus(req.hospitalId, req.params.id, req.body.status, req.user, req);
  res.json(new ApiResponse(200, appointment, 'Status updated'));
});

export const getAvailability = asyncHandler(async (req, res) => {
  const availability = await appointmentService.getDoctorAvailability(req.hospitalId, req.params.doctorId, req.query.date);
  res.json(new ApiResponse(200, availability));
});
