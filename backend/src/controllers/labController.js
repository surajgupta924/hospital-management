import * as labService from '../services/labService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createLabTest = asyncHandler(async (req, res) => {
  const report = await labService.createLabTest(req.hospitalId, req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, report, 'Lab test requested'));
});

export const getLabReports = asyncHandler(async (req, res) => {
  const result = await labService.getLabReports(req.hospitalId, req.query);
  res.json(new ApiResponse(200, result));
});

export const getLabReport = asyncHandler(async (req, res) => {
  const report = await labService.getLabReportById(req.hospitalId, req.params.id);
  res.json(new ApiResponse(200, report));
});

export const uploadReport = asyncHandler(async (req, res) => {
  const filePath = req.file ? `/uploads/lab-reports/${req.file.filename}` : null;
  const report = await labService.uploadLabReport(req.hospitalId, req.params.id, req.body, filePath, req.user, req);
  res.json(new ApiResponse(200, report, 'Report uploaded'));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const report = await labService.updateLabStatus(req.hospitalId, req.params.id, req.body.status, req.user, req);
  res.json(new ApiResponse(200, report, 'Status updated'));
});

export const downloadReport = asyncHandler(async (req, res) => {
  const report = await labService.getLabReportById(req.hospitalId, req.params.id);
  if (!report.reportFile) {
    return res.status(404).json({ success: false, message: 'Report file not found' });
  }
  res.download(`.${report.reportFile}`);
});
