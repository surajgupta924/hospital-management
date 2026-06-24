import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { ROLES } from './utils/constants';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Hospitals from './pages/hospitals/Hospitals';
import Doctors from './pages/doctors/Doctors';
import Patients from './pages/patients/Patients';
import Appointments from './pages/appointments/Appointments';
import Prescriptions from './pages/prescriptions/Prescriptions';
import Billing from './pages/billing/Billing';
import Laboratory from './pages/lab/Laboratory';
import Pharmacy from './pages/pharmacy/Pharmacy';
import AuditLogs from './pages/audit/AuditLogs';
import Settings from './pages/settings/Settings';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hospitals" element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]}><Hospitals /></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute roles={[ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR]}><Doctors /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute roles={[ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR]}><Patients /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute roles={[ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]}><Appointments /></ProtectedRoute>} />
        <Route path="/prescriptions" element={<ProtectedRoute roles={[ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT]}><Prescriptions /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute roles={[ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST]}><Billing /></ProtectedRoute>} />
        <Route path="/lab" element={<ProtectedRoute roles={[ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]}><Laboratory /></ProtectedRoute>} />
        <Route path="/pharmacy" element={<ProtectedRoute roles={[ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR]}><Pharmacy /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}><AuditLogs /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN]}><Settings /></ProtectedRoute>} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
