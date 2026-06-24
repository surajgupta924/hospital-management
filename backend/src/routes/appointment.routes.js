import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, setTenantContext } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createAppointmentSchema, idParamSchema } from '../validators/index.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, setTenantContext);

router.post('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT), validate(createAppointmentSchema), appointmentController.bookAppointment);
router.get('/availability/:doctorId', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT), appointmentController.getAvailability);
router.get('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT), appointmentController.getAppointments);
router.get('/:id', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT), validate(idParamSchema), appointmentController.getAppointment);
router.patch('/:id/reschedule', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT), appointmentController.rescheduleAppointment);
router.patch('/:id/cancel', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT), appointmentController.cancelAppointment);
router.patch('/:id/status', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), appointmentController.updateStatus);

export default router;
