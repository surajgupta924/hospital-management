import { Router } from 'express';
import * as prescriptionController from '../controllers/prescriptionController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, setTenantContext } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createPrescriptionSchema, idParamSchema } from '../validators/index.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, setTenantContext);

router.post('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR), validate(createPrescriptionSchema), prescriptionController.createPrescription);
router.get('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT), prescriptionController.getPrescriptions);
router.get('/patient/:patientId', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT), prescriptionController.getPatientHistory);
router.get('/:id/pdf', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT), prescriptionController.downloadPDF);
router.get('/:id', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT), validate(idParamSchema), prescriptionController.getPrescription);

export default router;
