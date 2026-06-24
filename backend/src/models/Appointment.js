import mongoose from 'mongoose';
import { APPOINTMENT_STATUS } from '../constants/status.js';

const appointmentSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.SCHEDULED,
    },
    reason: { type: String },
    notes: { type: String },
    symptoms: [String],
    visitType: { type: String, enum: ['consultation', 'follow_up', 'emergency', 'routine'], default: 'consultation' },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

appointmentSchema.index({ hospital: 1, appointmentDate: 1 });
appointmentSchema.index({ hospital: 1, doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ hospital: 1, patient: 1 });
appointmentSchema.index({ hospital: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
