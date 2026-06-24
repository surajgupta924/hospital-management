import Medicine from '../models/Medicine.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginatedResponse, buildSearchFilter, buildSort } from '../utils/pagination.js';
import { logAudit } from './auditService.js';

export const createMedicine = async (hospitalId, data, user, req) => {
  const medicine = await Medicine.create({
    ...data,
    hospital: hospitalId,
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
  });

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'CREATE',
    resource: 'Medicine',
    resourceId: medicine._id,
    req,
  });

  return medicine;
};

export const getMedicines = async (hospitalId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {
    hospital: hospitalId,
    isActive: true,
    ...buildSearchFilter(query.search, ['name', 'genericName', 'category']),
  };

  if (query.lowStock === 'true') {
    filter.$expr = { $lte: ['$quantity', '$reorderLevel'] };
  }

  const [medicines, total] = await Promise.all([
    Medicine.find(filter).sort(buildSort(query.sortBy || 'name', query.order || 'asc')).skip(skip).limit(limit),
    Medicine.countDocuments(filter),
  ]);

  return buildPaginatedResponse(medicines, total, page, limit);
};

export const getMedicineById = async (hospitalId, id) => {
  const medicine = await Medicine.findOne({ _id: id, hospital: hospitalId });
  if (!medicine) throw new ApiError(404, 'Medicine not found');
  return medicine;
};

export const updateMedicine = async (hospitalId, id, data, user, req) => {
  const medicine = await Medicine.findOneAndUpdate(
    { _id: id, hospital: hospitalId },
    { ...data, expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined },
    { new: true, runValidators: true }
  );

  if (!medicine) throw new ApiError(404, 'Medicine not found');

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'Medicine',
    resourceId: medicine._id,
    details: data,
    req,
  });

  return medicine;
};

export const updateStock = async (hospitalId, id, quantity, operation, user, req) => {
  const medicine = await Medicine.findOne({ _id: id, hospital: hospitalId });
  if (!medicine) throw new ApiError(404, 'Medicine not found');

  if (operation === 'add') {
    medicine.quantity += quantity;
  } else if (operation === 'subtract') {
    if (medicine.quantity < quantity) throw new ApiError(400, 'Insufficient stock');
    medicine.quantity -= quantity;
  } else {
    medicine.quantity = quantity;
  }

  await medicine.save();

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'MedicineStock',
    resourceId: medicine._id,
    details: { operation, quantity, newQuantity: medicine.quantity },
    req,
  });

  return medicine;
};

export const getLowStockAlerts = async (hospitalId) => {
  return Medicine.find({
    hospital: hospitalId,
    isActive: true,
    $expr: { $lte: ['$quantity', '$reorderLevel'] },
  }).sort({ quantity: 1 });
};

export const deleteMedicine = async (hospitalId, id, user, req) => {
  const medicine = await Medicine.findOneAndUpdate(
    { _id: id, hospital: hospitalId },
    { isActive: false },
    { new: true }
  );

  if (!medicine) throw new ApiError(404, 'Medicine not found');

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'DELETE',
    resource: 'Medicine',
    resourceId: medicine._id,
    req,
  });

  return { message: 'Medicine deactivated' };
};
