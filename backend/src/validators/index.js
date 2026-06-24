import { z } from 'zod';
import { ROLES } from '../constants/roles.js';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email(),
    password: passwordSchema,
    phone: z.string().optional(),
    role: z.enum([ROLES.HOSPITAL_ADMIN, ROLES.PATIENT]).optional(),
    hospitalName: z.string().min(2).optional(),
    hospitalSlug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: passwordSchema,
  }),
});

export const createHospitalSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    email: z.string().email(),
    phone: z.string().min(5),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    licenseNumber: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
  }),
});

export const updateHospitalSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    licenseNumber: z.string().optional(),
    website: z.string().optional(),
    settings: z.object({
      timezone: z.string().optional(),
      currency: z.string().optional(),
      appointmentDuration: z.number().optional(),
      workingHours: z.object({ start: z.string(), end: z.string() }).optional(),
      workingDays: z.array(z.number().min(0).max(6)).optional(),
      lowStockThreshold: z.number().optional(),
    }).optional(),
  }),
});

export const createDoctorSchema = z.object({
  body: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: passwordSchema,
    phone: z.string().optional(),
    department: z.string().optional(),
    specialization: z.string().min(2),
    qualification: z.string().optional(),
    licenseNumber: z.string().optional(),
    experience: z.number().optional(),
    consultationFee: z.number().optional(),
    bio: z.string().optional(),
    schedule: z.array(z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      isAvailable: z.boolean().optional(),
    })).optional(),
  }),
});

export const createPatientSchema = z.object({
  body: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().min(5),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    }).optional(),
    allergies: z.array(z.string()).optional(),
    insurance: z.object({
      provider: z.string().optional(),
      policyNumber: z.string().optional(),
      expiryDate: z.string().optional(),
    }).optional(),
  }),
});

export const createAppointmentSchema = z.object({
  body: z.object({
    patient: z.string().min(1),
    doctor: z.string().min(1),
    appointmentDate: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    reason: z.string().optional(),
    symptoms: z.array(z.string()).optional(),
    visitType: z.enum(['consultation', 'follow_up', 'emergency', 'routine']).optional(),
  }),
});

export const createPrescriptionSchema = z.object({
  body: z.object({
    patient: z.string().min(1),
    doctor: z.string().optional(),
    appointment: z.string().optional(),
    diagnosis: z.string().optional(),
    medicines: z.array(z.object({
      name: z.string().min(1),
      dosage: z.string().min(1),
      frequency: z.string().min(1),
      duration: z.string().min(1),
      instructions: z.string().optional(),
    })).min(1),
    notes: z.string().optional(),
    followUpDate: z.string().optional(),
  }),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    patient: z.string().min(1),
    appointment: z.string().optional(),
    items: z.array(z.object({
      description: z.string().min(1),
      quantity: z.number().min(1).optional(),
      unitPrice: z.number().min(0),
    })).min(1),
    tax: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createLabTestSchema = z.object({
  body: z.object({
    patient: z.string().min(1),
    doctor: z.string().min(1),
    appointment: z.string().optional(),
    testName: z.string().min(1),
    testType: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    genericName: z.string().optional(),
    category: z.string().optional(),
    manufacturer: z.string().optional(),
    batchNumber: z.string().optional(),
    unit: z.string().optional(),
    quantity: z.number().min(0),
    reorderLevel: z.number().min(0).optional(),
    unitPrice: z.number().min(0),
    sellingPrice: z.number().min(0),
    expiryDate: z.string().optional(),
    location: z.string().optional(),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});
