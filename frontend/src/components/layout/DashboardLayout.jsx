import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <main className="pl-64">
      <Outlet />
    </main>
  </div>
);

export default DashboardLayout;
