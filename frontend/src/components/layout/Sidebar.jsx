import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Stethoscope, Users, Calendar,
  FileText, Receipt, FlaskConical, Pill, ScrollText, Settings, LogOut, Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: Object.values(ROLES) },
  { label: 'Hospitals', path: '/hospitals', icon: Building2, roles: [ROLES.SUPER_ADMIN] },
  { label: 'Doctors', path: '/doctors', icon: Stethoscope, roles: [ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR] },
  { label: 'Patients', path: '/patients', icon: Users, roles: [ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR] },
  { label: 'Appointments', path: '/appointments', icon: Calendar, roles: [ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT] },
  { label: 'Prescriptions', path: '/prescriptions', icon: FileText, roles: [ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT] },
  { label: 'Billing', path: '/billing', icon: Receipt, roles: [ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST] },
  { label: 'Laboratory', path: '/lab', icon: FlaskConical, roles: [ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST] },
  { label: 'Pharmacy', path: '/pharmacy', icon: Pill, roles: [ROLES.HOSPITAL_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR] },
  { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText, roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const filteredNav = navItems.filter((item) => item.roles.some((role) => hasRole(role)));

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
        <Activity className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-lg font-bold text-gray-900">HMS SaaS</h1>
          <p className="text-xs text-gray-500">Hospital Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.hospital?.name || user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
