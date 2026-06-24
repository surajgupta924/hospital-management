import { Router } from 'express';
import * as patientController from '../controllers/patientController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, setTenantContext } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createPatientSchema, idParamSchema } from '../validators/index.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, setTenantContext);

router.post('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST), validate(createPatientSchema), patientController.registerPatient);
router.get('/search', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), patientController.searchPatients);
router.get('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), patientController.getPatients);
router.get('/:id', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT), validate(idParamSchema), patientController.getPatient);
router.put('/:id', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST), validate(idParamSchema), patientController.updatePatient);
router.post('/:id/medical-history', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR), patientController.addMedicalHistory);

export default router;
