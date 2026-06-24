import Hospital from '../models/Hospital.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginatedResponse, buildSearchFilter, buildSort } from '../utils/pagination.js';
import { logAudit } from './auditService.js';

export const createHospital = async (data, user, req) => {
  const exists = await Hospital.findOne({ $or: [{ slug: data.slug }, { email: data.email }] });
  if (exists) throw new ApiError(409, 'Hospital with this slug or email already exists');

  const hospital = await Hospital.create({ ...data, createdBy: user._id });

  await logAudit({
    user,
    action: 'CREATE',
    resource: 'Hospital',
    resourceId: hospital._id,
    req,
  });

  return hospital;
};

export const getHospitals = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { ...buildSearchFilter(query.search, ['name', 'email', 'slug']) };
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';

  const [hospitals, total] = await Promise.all([
    Hospital.find(filter).sort(buildSort(query.sortBy, query.order)).skip(skip).limit(limit),
    Hospital.countDocuments(filter),
  ]);

  return buildPaginatedResponse(hospitals, total, page, limit);
};

export const getHospitalById = async (id) => {
  const hospital = await Hospital.findById(id);
  if (!hospital) throw new ApiError(404, 'Hospital not found');
  return hospital;
};

export const updateHospital = async (id, data, user, req) => {
  const hospital = await Hospital.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!hospital) throw new ApiError(404, 'Hospital not found');

  await logAudit({
    hospital: hospital._id,
    user,
    action: 'UPDATE',
    resource: 'Hospital',
    resourceId: hospital._id,
    details: data,
    req,
  });

  return hospital;
};

export const updateHospitalSettings = async (id, settings, user, req) => {
  const hospital = await Hospital.findById(id);
  if (!hospital) throw new ApiError(404, 'Hospital not found');

  hospital.settings = { ...hospital.settings.toObject(), ...settings };
  await hospital.save();

  await logAudit({
    hospital: hospital._id,
    user,
    action: 'UPDATE',
    resource: 'HospitalSettings',
    resourceId: hospital._id,
    details: settings,
    req,
  });

  return hospital;
};
