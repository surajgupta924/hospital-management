import mongoose from 'mongoose';

const scheduleSlotSchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    specialization: { type: String, required: true },
    qualification: { type: String },
    licenseNumber: { type: String },
    experience: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    bio: { type: String },
    schedule: [scheduleSlotSchema],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorSchema.index({ hospital: 1 });
doctorSchema.index({ hospital: 1, specialization: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
