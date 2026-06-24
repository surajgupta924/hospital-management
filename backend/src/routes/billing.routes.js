import { Router } from 'express';
import * as billingController from '../controllers/billingController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, setTenantContext } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createInvoiceSchema, idParamSchema } from '../validators/index.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, setTenantContext);

router.post('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST), validate(createInvoiceSchema), billingController.createInvoice);
router.get('/revenue', authorize(ROLES.HOSPITAL_ADMIN), billingController.getRevenue);
router.get('/', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST), billingController.getInvoices);
router.get('/:id/pdf', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT), billingController.downloadPDF);
router.get('/:id', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT), validate(idParamSchema), billingController.getInvoice);
router.patch('/:id/payment', authorize(ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST), billingController.updatePayment);

export default router;
