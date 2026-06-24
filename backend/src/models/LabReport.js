import mongoose from 'mongoose';
import { LAB_STATUS } from '../constants/status.js';

const labReportSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    testNumber: { type: String, required: true },
    testName: { type: String, required: true },
    testType: { type: String },
    status: {
      type: String,
      enum: Object.values(LAB_STATUS),
      default: LAB_STATUS.REQUESTED,
    },
    requestedDate: { type: Date, default: Date.now },
    completedDate: { type: Date },
    results: { type: String },
    reportFile: { type: String },
    notes: { type: String },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

labReportSchema.index({ hospital: 1, testNumber: 1 }, { unique: true });
labReportSchema.index({ hospital: 1, patient: 1 });
labReportSchema.index({ hospital: 1, status: 1 });

const LabReport = mongoose.model('LabReport', labReportSchema);
export default LabReport;
