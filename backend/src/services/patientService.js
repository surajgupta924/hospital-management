import Patient from '../models/Patient.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginatedResponse, buildSearchFilter, buildSort } from '../utils/pagination.js';
import { logAudit } from './auditService.js';

const generatePatientId = async (hospitalId) => {
  const count = await Patient.countDocuments({ hospital: hospitalId });
  const year = new Date().getFullYear();
  return `PAT-${year}-${String(count + 1).padStart(5, '0')}`;
};

export const registerPatient = async (hospitalId, data, registeredBy, req) => {
  const patientId = await generatePatientId(hospitalId);

  const patient = await Patient.create({
    ...data,
    hospital: hospitalId,
    patientId,
    registeredBy: registeredBy._id,
  });

  await logAudit({
    hospital: hospitalId,
    user: registeredBy,
    action: 'CREATE',
    resource: 'Patient',
    resourceId: patient._id,
    req,
  });

  return patient;
};

export const getPatients = async (hospitalId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {
    hospital: hospitalId,
    isActive: true,
    ...buildSearchFilter(query.search, ['firstName', 'lastName', 'patientId', 'phone', 'email']),
  };

  const [patients, total] = await Promise.all([
    Patient.find(filter).sort(buildSort(query.sortBy || 'createdAt', query.order)).skip(skip).limit(limit),
    Patient.countDocuments(filter),
  ]);

  return buildPaginatedResponse(patients, total, page, limit);
};

export const getPatientById = async (hospitalId, id) => {
  const patient = await Patient.findOne({ _id: id, hospital: hospitalId });
  if (!patient) throw new ApiError(404, 'Patient not found');
  return patient;
};

export const updatePatient = async (hospitalId, id, data, user, req) => {
  const patient = await Patient.findOneAndUpdate(
    { _id: id, hospital: hospitalId },
    data,
    { new: true, runValidators: true }
  );

  if (!patient) throw new ApiError(404, 'Patient not found');

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'Patient',
    resourceId: patient._id,
    details: data,
    req,
  });

  return patient;
};

export const addMedicalHistory = async (hospitalId, id, historyData, user, req) => {
  const patient = await Patient.findOne({ _id: id, hospital: hospitalId });
  if (!patient) throw new ApiError(404, 'Patient not found');

  patient.medicalHistory.push(historyData);
  await patient.save();

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'CREATE',
    resource: 'MedicalHistory',
    resourceId: patient._id,
    details: historyData,
    req,
  });

  return patient;
};

export const searchPatients = async (hospitalId, search) => {
  return Patient.find({
    hospital: hospitalId,
    isActive: true,
    ...buildSearchFilter(search, ['firstName', 'lastName', 'patientId', 'phone']),
  }).limit(20);
};
