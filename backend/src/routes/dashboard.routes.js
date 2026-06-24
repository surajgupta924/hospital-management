import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, setTenantContext } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, setTenantContext);

router.get('/stats', authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST), dashboardController.getStats);
router.get('/charts/appointments', authorize(ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST), dashboardController.getAppointmentChart);
router.get('/charts/revenue', authorize(ROLES.HOSPITAL_ADMIN), dashboardController.getRevenueChart);
router.get('/audit-logs', authorize(ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN), dashboardController.getAuditLogs);

router.get('/notifications', notificationController.getNotifications);
router.patch('/notifications/read-all', notificationController.markAllAsRead);
router.patch('/notifications/:id/read', notificationController.markAsRead);

export default router;
