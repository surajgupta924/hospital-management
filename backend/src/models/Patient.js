import mongoose from 'mongoose';

const medicalHistorySchema = new mongoose.Schema(
  {
    condition: { type: String, required: true },
    diagnosedDate: { type: Date },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const patientSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    patientId: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    allergies: [String],
    medicalHistory: [medicalHistorySchema],
    insurance: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
    },
    isActive: { type: Boolean, default: true },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

patientSchema.index({ hospital: 1, patientId: 1 }, { unique: true });
patientSchema.index({ hospital: 1, phone: 1 });
patientSchema.index({ hospital: 1, firstName: 'text', lastName: 'text', patientId: 'text' });

patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
