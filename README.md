# Hospital Management System (HMS) SaaS

A production-ready, multi-tenant Hospital Management System built with the MERN stack. Multiple hospitals can operate on the same platform with complete data isolation.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, React Router v6, Tailwind CSS, Axios, Recharts, Context API |
| Backend | Node.js, Express.js, MVC + Service Layer |
| Database | MongoDB, Mongoose |
| Auth | JWT Access Tokens + HTTP-only Refresh Tokens |
| Validation | Zod |
| File Uploads | Multer |
| PDF Generation | PDFKit |

## Project Structure

```
hospital-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # DB & environment config
│   │   ├── constants/       # Roles, statuses
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, upload, errors
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── seed/            # Database seeding
│   │   ├── utils/           # Helpers, pagination, tokens
│   │   ├── validators/      # Zod schemas
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/             # File storage
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance & API services
│   │   ├── components/
│   │   │   ├── layout/      # Sidebar, Header, ProtectedRoute
│   │   │   └── ui/          # Reusable UI components
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Feature pages
│   │   └── utils/           # Constants & helpers
│   ├── index.html
│   └── package.json
└── README.md
```

## User Roles

| Role | Permissions |
|------|------------|
| **Super Admin** | Manage all hospitals, view platform stats, audit logs |
| **Hospital Admin** | Full hospital management, settings, all modules |
| **Doctor** | Patients, appointments, prescriptions, lab requests |
| **Receptionist** | Patient registration, appointments, billing, pharmacy |
| **Patient** | View own appointments, prescriptions |

## Multi-Tenancy

- Every hospital-scoped resource includes a `hospital` field
- `setTenantContext` middleware injects `req.hospitalId` from the authenticated user
- Super Admin can optionally specify `hospitalId` via query/params
- All database queries filter by `hospitalId` for data isolation

## API Routes

Base URL: `http://localhost:5000/api/v1`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register hospital + admin |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/profile` | Get current user |

### Hospitals (Super Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/hospitals` | Create hospital |
| GET | `/hospitals` | List hospitals |
| GET | `/hospitals/:id` | Get hospital |
| PUT | `/hospitals/:id` | Update hospital |
| PATCH | `/hospitals/:id/settings` | Update settings |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/doctors` | Add doctor |
| GET | `/doctors` | List doctors |
| GET | `/doctors/:id` | Get doctor |
| PUT | `/doctors/:id` | Update doctor |
| DELETE | `/doctors/:id` | Deactivate doctor |
| PATCH | `/doctors/:id/schedule` | Update schedule |
| GET/POST | `/doctors/departments` | Manage departments |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/patients` | Register patient |
| GET | `/patients` | List patients |
| GET | `/patients/search?q=` | Search patients |
| GET | `/patients/:id` | Get patient |
| PUT | `/patients/:id` | Update patient |
| POST | `/patients/:id/medical-history` | Add medical history |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/appointments` | Book appointment |
| GET | `/appointments` | List appointments |
| GET | `/appointments/availability/:doctorId` | Doctor availability |
| PATCH | `/appointments/:id/reschedule` | Reschedule |
| PATCH | `/appointments/:id/cancel` | Cancel |
| PATCH | `/appointments/:id/status` | Update status |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/prescriptions` | Create prescription |
| GET | `/prescriptions` | List prescriptions |
| GET | `/prescriptions/:id/pdf` | Download PDF |
| GET | `/prescriptions/patient/:patientId` | Patient history |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/billing` | Create invoice |
| GET | `/billing` | List invoices |
| GET | `/billing/revenue` | Revenue analytics |
| GET | `/billing/:id/pdf` | Download invoice PDF |
| PATCH | `/billing/:id/payment` | Update payment |

### Laboratory
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/lab` | Request lab test |
| GET | `/lab` | List reports |
| PATCH | `/lab/:id/upload` | Upload report file |
| PATCH | `/lab/:id/status` | Update status |
| GET | `/lab/:id/download` | Download report |

### Pharmacy
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pharmacy` | Add medicine |
| GET | `/pharmacy` | List inventory |
| GET | `/pharmacy/low-stock` | Low stock alerts |
| PATCH | `/pharmacy/:id/stock` | Update stock |
| PUT/DELETE | `/pharmacy/:id` | Update/delete medicine |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Dashboard statistics |
| GET | `/dashboard/charts/appointments` | Appointment chart data |
| GET | `/dashboard/charts/revenue` | Revenue chart data |
| GET | `/dashboard/audit-logs` | Audit logs |
| GET | `/dashboard/notifications` | User notifications |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/hms_saas
JWT_ACCESS_SECRET=your_secure_access_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1

### Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@hms.com | Admin@12345 |
| Hospital Admin | admin@citygeneral.com | Admin@12345 |
| Doctor | doctor@citygeneral.com | Admin@12345 |
| Receptionist | reception@citygeneral.com | Admin@12345 |

## Step-by-Step Implementation Plan

### Phase 1: Foundation (Completed)
- [x] Project scaffolding (backend + frontend)
- [x] MongoDB schemas for all entities
- [x] JWT authentication with refresh tokens
- [x] Multi-tenant middleware
- [x] Centralized error handling
- [x] Zod validation middleware

### Phase 2: Core Modules (Completed)
- [x] Hospital management (CRUD + settings)
- [x] Doctor management (CRUD + schedule)
- [x] Patient management (registration + medical history)
- [x] Appointment management (book, reschedule, cancel)
- [x] Prescription management + PDF download
- [x] Billing system + invoice PDF
- [x] Laboratory module + file upload
- [x] Pharmacy inventory + low stock alerts

### Phase 3: Dashboard & Analytics (Completed)
- [x] Role-based dashboard with stats
- [x] Recharts appointment & revenue charts
- [x] Audit logging for all actions
- [x] Notification system (appointment & prescription reminders)

### Phase 4: Frontend (Completed)
- [x] Modern SaaS dashboard UI with Tailwind
- [x] Sidebar navigation with role-based menu
- [x] Protected routes with role authorization
- [x] Data tables with pagination & search
- [x] Modal forms for CRUD operations
- [x] Loading states & error handling (react-hot-toast)
- [x] Axios interceptors with auto token refresh

### Phase 5: Production Hardening (Recommended Next Steps)
- [ ] Add unit & integration tests (Jest + Supertest)
- [ ] Set up CI/CD pipeline
- [ ] Configure production MongoDB (Atlas) with replica set
- [ ] Add Redis for session/token caching
- [ ] Implement email service (Nodemailer) for password reset
- [ ] Add cron jobs for notification reminders (node-cron)
- [ ] Docker containerization
- [ ] Rate limiting per tenant
- [ ] API documentation with Swagger/OpenAPI
- [ ] WebSocket for real-time notifications

## Database Schemas

### Users
`firstName`, `lastName`, `email`, `password`, `role`, `hospital`, `isActive`, `resetPasswordToken`

### Hospitals
`name`, `slug`, `email`, `phone`, `address`, `settings`, `subscription`, `isActive`

### Doctors
`hospital`, `user`, `department`, `specialization`, `schedule[]`, `consultationFee`

### Patients
`hospital`, `patientId`, `firstName`, `lastName`, `medicalHistory[]`, `allergies`, `insurance`

### Appointments
`hospital`, `patient`, `doctor`, `appointmentDate`, `startTime`, `endTime`, `status`

### Prescriptions
`hospital`, `patient`, `doctor`, `prescriptionNumber`, `medicines[]`, `diagnosis`

### Invoices
`hospital`, `patient`, `invoiceNumber`, `items[]`, `total`, `paymentStatus`

### Medicines
`hospital`, `name`, `quantity`, `reorderLevel`, `unitPrice`, `sellingPrice`

### Lab Reports
`hospital`, `patient`, `doctor`, `testNumber`, `testName`, `status`, `reportFile`

### Audit Logs
`hospital`, `user`, `action`, `resource`, `resourceId`, `details`, `ipAddress`

## Authentication Flow

```
1. User submits login credentials
2. Server validates → returns accessToken (15min) + refreshToken (7d, HTTP-only cookie)
3. Frontend stores accessToken in localStorage
4. Axios interceptor attaches Bearer token to all requests
5. On 401 → auto-refresh using refreshToken cookie
6. On refresh failure → redirect to login
7. Logout → revoke refreshToken + clear cookies
```

## License

MIT
