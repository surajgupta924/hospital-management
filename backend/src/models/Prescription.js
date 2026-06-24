import mongoose from 'mongoose';

const medicineItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    prescriptionNumber: { type: String, required: true },
    diagnosis: { type: String },
    medicines: [medicineItemSchema],
    notes: { type: String },
    followUpDate: { type: Date },
    reminderSent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

prescriptionSchema.index({ hospital: 1, prescriptionNumber: 1 }, { unique: true });
prescriptionSchema.index({ hospital: 1, patient: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
