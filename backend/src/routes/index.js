import { Router } from 'express';
import authRoutes from './auth.routes.js';
import hospitalRoutes from './hospital.routes.js';
import doctorRoutes from './doctor.routes.js';
import patientRoutes from './patient.routes.js';
import appointmentRoutes from './appointment.routes.js';
import prescriptionRoutes from './prescription.routes.js';
import billingRoutes from './billing.routes.js';
import labRoutes from './lab.routes.js';
import pharmacyRoutes from './pharmacy.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'HMS API is running', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/doctors', doctorRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/billing', billingRoutes);
router.use('/lab', labRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
