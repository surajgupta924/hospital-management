import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    category: { type: String, trim: true },
    manufacturer: { type: String },
    batchNumber: { type: String },
    unit: { type: String, default: 'tablet' },
    quantity: { type: Number, required: true, min: 0 },
    reorderLevel: { type: Number, default: 10 },
    unitPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    expiryDate: { type: Date },
    location: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

medicineSchema.index({ hospital: 1, name: 1 });
medicineSchema.index({ hospital: 1, quantity: 1 });

medicineSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.reorderLevel;
});

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
