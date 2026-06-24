import * as dashboardService from '../services/dashboardService.js';
import AuditLog from '../models/AuditLog.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ROLES } from '../constants/roles.js';

export const getStats = asyncHandler(async (req, res) => {
  if (req.user.role === ROLES.SUPER_ADMIN && !req.hospitalId) {
    const stats = await dashboardService.getSuperAdminStats();
    return res.json(new ApiResponse(200, stats));
  }
  const stats = await dashboardService.getDashboardStats(req.hospitalId);
  res.json(new ApiResponse(200, stats));
});

export const getAppointmentChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAppointmentChart(req.hospitalId, parseInt(req.query.days, 10) || 7);
  res.json(new ApiResponse(200, data));
});

export const getRevenueChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRevenueChart(req.hospitalId, parseInt(req.query.months, 10) || 6);
  res.json(new ApiResponse(200, data));
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = req.hospitalId ? { hospital: req.hospitalId } : {};

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  res.json(new ApiResponse(200, buildPaginatedResponse(logs, total, page, limit)));
});
