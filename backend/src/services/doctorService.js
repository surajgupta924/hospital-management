import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import { getPagination, buildPaginatedResponse, buildSort } from '../utils/pagination.js';
import { logAudit } from './auditService.js';

export const createDoctor = async (hospitalId, data, createdBy, req) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: ROLES.DOCTOR,
    hospital: hospitalId,
  });

  const doctor = await Doctor.create({
    hospital: hospitalId,
    user: user._id,
    department: data.department,
    specialization: data.specialization,
    qualification: data.qualification,
    licenseNumber: data.licenseNumber,
    experience: data.experience,
    consultationFee: data.consultationFee,
    bio: data.bio,
    schedule: data.schedule || [],
  });

  await logAudit({
    hospital: hospitalId,
    user: createdBy,
    action: 'CREATE',
    resource: 'Doctor',
    resourceId: doctor._id,
    req,
  });

  return Doctor.findById(doctor._id)
    .populate('user', 'firstName lastName email phone')
    .populate('department', 'name');
};

export const getDoctors = async (hospitalId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { hospital: hospitalId };

  if (query.department) filter.department = query.department;
  if (query.specialization) filter.specialization = { $regex: query.specialization, $options: 'i' };
  if (query.isAvailable !== undefined) filter.isAvailable = query.isAvailable === 'true';

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('department', 'name')
      .sort(buildSort(query.sortBy || 'createdAt', query.order))
      .skip(skip)
      .limit(limit),
    Doctor.countDocuments(filter),
  ]);

  return buildPaginatedResponse(doctors, total, page, limit);
};

export const getDoctorById = async (hospitalId, id) => {
  const doctor = await Doctor.findOne({ _id: id, hospital: hospitalId })
    .populate('user', 'firstName lastName email phone avatar')
    .populate('department', 'name');
  if (!doctor) throw new ApiError(404, 'Doctor not found');
  return doctor;
};

export const updateDoctor = async (hospitalId, id, data, user, req) => {
  const doctor = await Doctor.findOne({ _id: id, hospital: hospitalId });
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  const { firstName, lastName, phone, ...doctorData } = data;

  if (firstName || lastName || phone) {
    await User.findByIdAndUpdate(doctor.user, { firstName, lastName, phone });
  }

  Object.assign(doctor, doctorData);
  await doctor.save();

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'Doctor',
    resourceId: doctor._id,
    details: data,
    req,
  });

  return getDoctorById(hospitalId, id);
};

export const deleteDoctor = async (hospitalId, id, user, req) => {
  const doctor = await Doctor.findOne({ _id: id, hospital: hospitalId });
  if (!doctor) throw new ApiError(404, 'Doctor not found');

  doctor.isAvailable = false;
  await doctor.save();
  await User.findByIdAndUpdate(doctor.user, { isActive: false });

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'DELETE',
    resource: 'Doctor',
    resourceId: doctor._id,
    req,
  });

  return { message: 'Doctor deactivated successfully' };
};

export const updateDoctorSchedule = async (hospitalId, id, schedule, user, req) => {
  const doctor = await Doctor.findOneAndUpdate(
    { _id: id, hospital: hospitalId },
    { schedule },
    { new: true }
  ).populate('user', 'firstName lastName');

  if (!doctor) throw new ApiError(404, 'Doctor not found');

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'DoctorSchedule',
    resourceId: doctor._id,
    req,
  });

  return doctor;
};

export const getDepartments = async (hospitalId) => {
  return Department.find({ hospital: hospitalId, isActive: true });
};

export const createDepartment = async (hospitalId, data, user, req) => {
  const department = await Department.create({ ...data, hospital: hospitalId });

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'CREATE',
    resource: 'Department',
    resourceId: department._id,
    req,
  });

  return department;
};
