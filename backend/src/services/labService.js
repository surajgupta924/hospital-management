import LabReport from '../models/LabReport.js';
import ApiError from '../utils/ApiError.js';
import { LAB_STATUS } from '../constants/status.js';
import { getPagination, buildPaginatedResponse, buildSort } from '../utils/pagination.js';
import { logAudit } from './auditService.js';

const generateTestNumber = async (hospitalId) => {
  const count = await LabReport.countDocuments({ hospital: hospitalId });
  return `LAB-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
};

export const createLabTest = async (hospitalId, data, user, req) => {
  const labReport = await LabReport.create({
    ...data,
    hospital: hospitalId,
    testNumber: await generateTestNumber(hospitalId),
    requestedBy: user._id,
  });

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'CREATE',
    resource: 'LabReport',
    resourceId: labReport._id,
    req,
  });

  return LabReport.findById(labReport._id)
    .populate('patient', 'firstName lastName patientId')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } });
};

export const getLabReports = async (hospitalId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { hospital: hospitalId };

  if (query.status) filter.status = query.status;
  if (query.patient) filter.patient = query.patient;

  const [reports, total] = await Promise.all([
    LabReport.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .sort(buildSort(query.sortBy || 'createdAt', query.order || 'desc'))
      .skip(skip)
      .limit(limit),
    LabReport.countDocuments(filter),
  ]);

  return buildPaginatedResponse(reports, total, page, limit);
};

export const getLabReportById = async (hospitalId, id) => {
  const report = await LabReport.findOne({ _id: id, hospital: hospitalId })
    .populate('patient')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } });
  if (!report) throw new ApiError(404, 'Lab report not found');
  return report;
};

export const uploadLabReport = async (hospitalId, id, data, filePath, user, req) => {
  const report = await LabReport.findOne({ _id: id, hospital: hospitalId });
  if (!report) throw new ApiError(404, 'Lab report not found');

  report.reportFile = filePath;
  report.results = data.results || report.results;
  report.status = LAB_STATUS.COMPLETED;
  report.completedDate = new Date();
  report.performedBy = user._id;
  await report.save();

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'LabReport',
    resourceId: report._id,
    details: { action: 'upload_report' },
    req,
  });

  return report;
};

export const updateLabStatus = async (hospitalId, id, status, user, req) => {
  const report = await LabReport.findOneAndUpdate(
    { _id: id, hospital: hospitalId },
    { status, ...(status === LAB_STATUS.COMPLETED && { completedDate: new Date() }) },
    { new: true }
  );

  if (!report) throw new ApiError(404, 'Lab report not found');

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'LabReport',
    resourceId: report._id,
    details: { status },
    req,
  });

  return report;
};
