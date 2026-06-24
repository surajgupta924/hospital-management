import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' },
    },
    logo: { type: String },
    licenseNumber: { type: String },
    website: { type: String },
    settings: {
      timezone: { type: String, default: 'UTC' },
      currency: { type: String, default: 'USD' },
      appointmentDuration: { type: Number, default: 30 },
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '17:00' },
      },
      workingDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5],
      },
      lowStockThreshold: { type: Number, default: 10 },
    },
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'basic' },
      status: { type: String, enum: ['active', 'trial', 'suspended', 'cancelled'], default: 'trial' },
      expiresAt: { type: Date },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

hospitalSchema.index({ slug: 1 });
hospitalSchema.index({ name: 'text', email: 'text' });

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;
