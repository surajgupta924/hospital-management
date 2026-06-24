import { Router } from 'express';
import * as pharmacyController from '../controllers/pharmacyController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, setTenantContext } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createMedicineSchema, idParamSchema } from '../validators/index.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, setTenantContext);

router.get('/low-stock', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST), pharmacyController.getLowStock);
router.post('/', authorize(ROLES.HOSPITAL_ADMIN), validate(createMedicineSchema), pharmacyController.createMedicine);
router.get('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), pharmacyController.getMedicines);
router.get('/:id', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR), validate(idParamSchema), pharmacyController.getMedicine);
router.put('/:id', authorize(ROLES.HOSPITAL_ADMIN), validate(idParamSchema), pharmacyController.updateMedicine);
router.patch('/:id/stock', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST), pharmacyController.updateStock);
router.delete('/:id', authorize(ROLES.HOSPITAL_ADMIN), validate(idParamSchema), pharmacyController.deleteMedicine);

export default router;
