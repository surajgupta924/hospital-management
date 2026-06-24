import { Router } from 'express';
import * as labController from '../controllers/labController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, setTenantContext } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createLabTestSchema, idParamSchema } from '../validators/index.js';
import { upload, setUploadType } from '../middleware/upload.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, setTenantContext);

router.post('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR), validate(createLabTestSchema), labController.createLabTest);
router.get('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT), labController.getLabReports);
router.get('/:id/download', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT), labController.downloadReport);
router.get('/:id', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT), validate(idParamSchema), labController.getLabReport);
router.patch('/:id/upload', authorize(ROLES.HOSPITAL_ADMIN), setUploadType('lab-reports'), upload.single('report'), labController.uploadReport);
router.patch('/:id/status', authorize(ROLES.HOSPITAL_ADMIN), labController.updateStatus);

export default router;
