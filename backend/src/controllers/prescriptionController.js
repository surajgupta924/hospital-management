import * as prescriptionService from '../services/prescriptionService.js';
import * as pdfService from '../services/pdfService.js';
import Hospital from '../models/Hospital.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createPrescription = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.createPrescription(req.hospitalId, req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, prescription, 'Prescription created'));
});

export const getPrescriptions = asyncHandler(async (req, res) => {
  const result = await prescriptionService.getPrescriptions(req.hospitalId, req.query);
  res.json(new ApiResponse(200, result));
});

export const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.getPrescriptionById(req.hospitalId, req.params.id);
  res.json(new ApiResponse(200, prescription));
});

export const getPatientHistory = asyncHandler(async (req, res) => {
  const history = await prescriptionService.getPatientPrescriptionHistory(req.hospitalId, req.params.patientId);
  res.json(new ApiResponse(200, history));
});

export const downloadPDF = asyncHandler(async (req, res) => {
  const prescription = await prescriptionService.getPrescriptionById(req.hospitalId, req.params.id);
  const hospital = await Hospital.findById(req.hospitalId);
  const pdf = await pdfService.generatePrescriptionPDF(prescription, hospital);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription.prescriptionNumber}.pdf`);
  res.send(pdf);
});
