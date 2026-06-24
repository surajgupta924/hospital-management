import { Router } from 'express';
import * as hospitalController from '../controllers/hospitalController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createHospitalSchema, updateHospitalSchema, idParamSchema } from '../validators/index.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(ROLES.SUPER_ADMIN), validate(createHospitalSchema), hospitalController.createHospital);
router.get('/', authorize(ROLES.SUPER_ADMIN), hospitalController.getHospitals);
router.get('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN), validate(idParamSchema), hospitalController.getHospital);
router.put('/:id', authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN), validate(updateHospitalSchema), hospitalController.updateHospital);
router.patch('/:id/settings', authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN), hospitalController.updateSettings);

export default router;
