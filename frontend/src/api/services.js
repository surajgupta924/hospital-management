import api from '../api/axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/profile'),
};

export const hospitalAPI = {
  getAll: (params) => api.get('/hospitals', { params }),
  getById: (id) => api.get(`/hospitals/${id}`),
  create: (data) => api.post('/hospitals', data),
  update: (id, data) => api.put(`/hospitals/${id}`, data),
  updateSettings: (id, settings) => api.patch(`/hospitals/${id}/settings`, { settings }),
};

export const doctorAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  delete: (id) => api.delete(`/doctors/${id}`),
  updateSchedule: (id, schedule) => api.patch(`/doctors/${id}/schedule`, { schedule }),
  getDepartments: () => api.get('/doctors/departments'),
  createDepartment: (data) => api.post('/doctors/departments', data),
};

export const patientAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getById: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  search: (q) => api.get('/patients/search', { params: { q } }),
  addMedicalHistory: (id, data) => api.post(`/patients/${id}/medical-history`, data),
};

export const appointmentAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data),
  cancel: (id, reason) => api.patch(`/appointments/${id}/cancel`, { reason }),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  getAvailability: (doctorId, date) => api.get(`/appointments/availability/${doctorId}`, { params: { date } }),
};

export const prescriptionAPI = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  getPatientHistory: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
  downloadPDF: (id) => api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' }),
};

export const billingAPI = {
  getAll: (params) => api.get('/billing', { params }),
  getById: (id) => api.get(`/billing/${id}`),
  create: (data) => api.post('/billing', data),
  updatePayment: (id, data) => api.patch(`/billing/${id}/payment`, data),
  getRevenue: (params) => api.get('/billing/revenue', { params }),
  downloadPDF: (id) => api.get(`/billing/${id}/pdf`, { responseType: 'blob' }),
};

export const labAPI = {
  getAll: (params) => api.get('/lab', { params }),
  getById: (id) => api.get(`/lab/${id}`),
  create: (data) => api.post('/lab', data),
  uploadReport: (id, formData) => api.patch(`/lab/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id, status) => api.patch(`/lab/${id}/status`, { status }),
  downloadReport: (id) => api.get(`/lab/${id}/download`, { responseType: 'blob' }),
};

export const pharmacyAPI = {
  getAll: (params) => api.get('/pharmacy', { params }),
  getById: (id) => api.get(`/pharmacy/${id}`),
  create: (data) => api.post('/pharmacy', data),
  update: (id, data) => api.put(`/pharmacy/${id}`, data),
  updateStock: (id, quantity, operation) => api.patch(`/pharmacy/${id}/stock`, { quantity, operation }),
  getLowStock: () => api.get('/pharmacy/low-stock'),
  delete: (id) => api.delete(`/pharmacy/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAppointmentChart: (days) => api.get('/dashboard/charts/appointments', { params: { days } }),
  getRevenueChart: (months) => api.get('/dashboard/charts/revenue', { params: { months } }),
  getAuditLogs: (params) => api.get('/dashboard/audit-logs', { params }),
  getNotifications: (params) => api.get('/dashboard/notifications', { params }),
  markNotificationRead: (id) => api.patch(`/dashboard/notifications/${id}/read`),
  markAllNotificationsRead: () => api.patch('/dashboard/notifications/read-all'),
};
