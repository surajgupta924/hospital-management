import * as pharmacyService from '../services/pharmacyService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createMedicine = asyncHandler(async (req, res) => {
  const medicine = await pharmacyService.createMedicine(req.hospitalId, req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, medicine, 'Medicine added'));
});

export const getMedicines = asyncHandler(async (req, res) => {
  const result = await pharmacyService.getMedicines(req.hospitalId, req.query);
  res.json(new ApiResponse(200, result));
});

export const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await pharmacyService.getMedicineById(req.hospitalId, req.params.id);
  res.json(new ApiResponse(200, medicine));
});

export const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await pharmacyService.updateMedicine(req.hospitalId, req.params.id, req.body, req.user, req);
  res.json(new ApiResponse(200, medicine, 'Medicine updated'));
});

export const updateStock = asyncHandler(async (req, res) => {
  const medicine = await pharmacyService.updateStock(req.hospitalId, req.params.id, req.body.quantity, req.body.operation, req.user, req);
  res.json(new ApiResponse(200, medicine, 'Stock updated'));
});

export const getLowStock = asyncHandler(async (req, res) => {
  const medicines = await pharmacyService.getLowStockAlerts(req.hospitalId);
  res.json(new ApiResponse(200, medicines));
});

export const deleteMedicine = asyncHandler(async (req, res) => {
  const result = await pharmacyService.deleteMedicine(req.hospitalId, req.params.id, req.user, req);
  res.json(new ApiResponse(200, result));
});
