export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HOSPITAL_ADMIN: 'hospital_admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient',
};

export const APPOINTMENT_STATUS = {
  scheduled: { label: 'Scheduled', color: 'blue' },
  confirmed: { label: 'Confirmed', color: 'green' },
  in_progress: { label: 'In Progress', color: 'yellow' },
  completed: { label: 'Completed', color: 'gray' },
  cancelled: { label: 'Cancelled', color: 'red' },
  no_show: { label: 'No Show', color: 'orange' },
};

export const PAYMENT_STATUS = {
  pending: { label: 'Pending', color: 'yellow' },
  partial: { label: 'Partial', color: 'orange' },
  paid: { label: 'Paid', color: 'green' },
  refunded: { label: 'Refunded', color: 'gray' },
  cancelled: { label: 'Cancelled', color: 'red' },
};

export const LAB_STATUS = {
  requested: { label: 'Requested', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'yellow' },
  completed: { label: 'Completed', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  hospital_admin: 'Hospital Admin',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  patient: 'Patient',
};
