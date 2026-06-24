import * as patientService from '../services/patientService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const registerPatient = asyncHandler(async (req, res) => {
  const patient = await patientService.registerPatient(req.hospitalId, req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, patient, 'Patient registered'));
});

export const getPatients = asyncHandler(async (req, res) => {
  const result = await patientService.getPatients(req.hospitalId, req.query);
  res.json(new ApiResponse(200, result));
});

export const getPatient = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(req.hospitalId, req.params.id);
  res.json(new ApiResponse(200, patient));
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.updatePatient(req.hospitalId, req.params.id, req.body, req.user, req);
  res.json(new ApiResponse(200, patient, 'Patient updated'));
});

export const addMedicalHistory = asyncHandler(async (req, res) => {
  const patient = await patientService.addMedicalHistory(req.hospitalId, req.params.id, req.body, req.user, req);
  res.json(new ApiResponse(200, patient, 'Medical history added'));
});

export const searchPatients = asyncHandler(async (req, res) => {
  const patients = await patientService.searchPatients(req.hospitalId, req.query.q);
  res.json(new ApiResponse(200, patients));
});
