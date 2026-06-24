import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    headDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

departmentSchema.index({ hospital: 1, name: 1 }, { unique: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
