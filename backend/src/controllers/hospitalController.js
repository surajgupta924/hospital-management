import * as hospitalService from '../services/hospitalService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createHospital = asyncHandler(async (req, res) => {
  const hospital = await hospitalService.createHospital(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, hospital, 'Hospital created'));
});

export const getHospitals = asyncHandler(async (req, res) => {
  const result = await hospitalService.getHospitals(req.query);
  res.json(new ApiResponse(200, result));
});

export const getHospital = asyncHandler(async (req, res) => {
  const hospital = await hospitalService.getHospitalById(req.params.id);
  res.json(new ApiResponse(200, hospital));
});

export const updateHospital = asyncHandler(async (req, res) => {
  const hospital = await hospitalService.updateHospital(req.params.id, req.body, req.user, req);
  res.json(new ApiResponse(200, hospital, 'Hospital updated'));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const hospital = await hospitalService.updateHospitalSettings(req.params.id, req.body.settings, req.user, req);
  res.json(new ApiResponse(200, hospital, 'Settings updated'));
});
