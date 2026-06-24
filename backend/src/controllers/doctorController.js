import * as doctorService from '../services/doctorService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.createDoctor(req.hospitalId, req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, doctor, 'Doctor created'));
});

export const getDoctors = asyncHandler(async (req, res) => {
  const result = await doctorService.getDoctors(req.hospitalId, req.query);
  res.json(new ApiResponse(200, result));
});

export const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getDoctorById(req.hospitalId, req.params.id);
  res.json(new ApiResponse(200, doctor));
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateDoctor(req.hospitalId, req.params.id, req.body, req.user, req);
  res.json(new ApiResponse(200, doctor, 'Doctor updated'));
});

export const deleteDoctor = asyncHandler(async (req, res) => {
  const result = await doctorService.deleteDoctor(req.hospitalId, req.params.id, req.user, req);
  res.json(new ApiResponse(200, result));
});

export const updateSchedule = asyncHandler(async (req, res) => {
  const doctor = await doctorService.updateDoctorSchedule(req.hospitalId, req.params.id, req.body.schedule, req.user, req);
  res.json(new ApiResponse(200, doctor, 'Schedule updated'));
});

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await doctorService.getDepartments(req.hospitalId);
  res.json(new ApiResponse(200, departments));
});

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await doctorService.createDepartment(req.hospitalId, req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, department, 'Department created'));
});
