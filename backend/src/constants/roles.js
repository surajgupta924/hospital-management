export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HOSPITAL_ADMIN: 'hospital_admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient',
};

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 5,
  [ROLES.HOSPITAL_ADMIN]: 4,
  [ROLES.DOCTOR]: 3,
  [ROLES.RECEPTIONIST]: 2,
  [ROLES.PATIENT]: 1,
};

export const HOSPITAL_ROLES = [
  ROLES.HOSPITAL_ADMIN,
  ROLES.DOCTOR,
  ROLES.RECEPTIONIST,
  ROLES.PATIENT,
];
