import mongoose from 'mongoose';

export const resolveHospitalId = (user, requestedHospitalId) => {
  if (user.role === 'super_admin') {
    return requestedHospitalId ? new mongoose.Types.ObjectId(requestedHospitalId) : null;
  }
  return user.hospital ? new mongoose.Types.ObjectId(user.hospital) : null;
};

export const tenantFilter = (user, hospitalIdField = 'hospital') => {
  if (user.role === 'super_admin') return {};
  if (!user.hospital) throw new Error('User is not associated with a hospital');
  return { [hospitalIdField]: user.hospital };
};
