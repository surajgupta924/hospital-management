import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginatedResponse, buildSort } from '../utils/pagination.js';
import { logAudit } from './auditService.js';

const generatePrescriptionNumber = async (hospitalId) => {
  const count = await Prescription.countDocuments({ hospital: hospitalId });
  return `RX-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
};

export const createPrescription = async (hospitalId, data, user, req) => {
  let doctorId = data.doctor;

  if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: user._id, hospital: hospitalId });
    if (!doctor) throw new ApiError(403, 'Doctor profile not found');
    doctorId = doctor._id;
  }

  const prescriptionNumber = await generatePrescriptionNumber(hospitalId);

  const prescription = await Prescription.create({
    ...data,
    hospital: hospitalId,
    doctor: doctorId,
    prescriptionNumber,
    followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
  });

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'CREATE',
    resource: 'Prescription',
    resourceId: prescription._id,
    req,
  });

  return Prescription.findById(prescription._id)
    .populate('patient', 'firstName lastName patientId')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } });
};

export const getPrescriptions = async (hospitalId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { hospital: hospitalId, isActive: true };

  if (query.patient) filter.patient = query.patient;
  if (query.doctor) filter.doctor = query.doctor;

  const [prescriptions, total] = await Promise.all([
    Prescription.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
      .sort(buildSort(query.sortBy || 'createdAt', query.order || 'desc'))
      .skip(skip)
      .limit(limit),
    Prescription.countDocuments(filter),
  ]);

  return buildPaginatedResponse(prescriptions, total, page, limit);
};

export const getPrescriptionById = async (hospitalId, id) => {
  const prescription = await Prescription.findOne({ _id: id, hospital: hospitalId })
    .populate('patient')
    .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
    .populate('appointment');
  if (!prescription) throw new ApiError(404, 'Prescription not found');
  return prescription;
};

export const getPatientPrescriptionHistory = async (hospitalId, patientId) => {
  return Prescription.find({ hospital: hospitalId, patient: patientId, isActive: true })
    .populate({ path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } })
    .sort({ createdAt: -1 });
};
