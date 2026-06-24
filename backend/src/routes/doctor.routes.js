import { Router } from 'express';
import * as doctorController from '../controllers/doctorController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, setTenantContext } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createDoctorSchema, idParamSchema } from '../validators/index.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, setTenantContext);

router.get('/departments', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), doctorController.getDepartments);
router.post('/departments', authorize(ROLES.HOSPITAL_ADMIN), doctorController.createDepartment);
router.post('/', authorize(ROLES.HOSPITAL_ADMIN), validate(createDoctorSchema), doctorController.createDoctor);
router.get('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), doctorController.getDoctors);
router.get('/:id', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), validate(idParamSchema), doctorController.getDoctor);
router.put('/:id', authorize(ROLES.HOSPITAL_ADMIN), validate(idParamSchema), doctorController.updateDoctor);
router.delete('/:id', authorize(ROLES.HOSPITAL_ADMIN), validate(idParamSchema), doctorController.deleteDoctor);
router.patch('/:id/schedule', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR), doctorController.updateSchedule);

export default router;
