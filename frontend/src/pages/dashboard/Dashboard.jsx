import { useEffect, useState } from 'react';
import { Users, Stethoscope, Calendar, DollarSign, Building2, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { dashboardAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointmentChart, setAppointmentChart] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, aptRes, revRes] = await Promise.all([
          dashboardAPI.getStats(),
          !isSuperAdmin() ? dashboardAPI.getAppointmentChart(7) : Promise.resolve({ data: { data: [] } }),
          !isSuperAdmin() ? dashboardAPI.getRevenueChart(6) : Promise.resolve({ data: { data: [] } }),
        ]);
        setStats(statsRes.data.data);
        setAppointmentChart(aptRes.data.data.map((d) => ({ date: d._id, count: d.count })));
        setRevenueChart(revRes.data.data.map((d) => ({
          month: `${d._id.month}/${d._id.year}`,
          revenue: d.revenue,
        })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Overview of your hospital operations" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isSuperAdmin() ? (
            <>
              <StatCard title="Total Hospitals" value={stats?.totalHospitals || 0} icon={Building2} color="bg-blue-500" />
              <StatCard title="Active Hospitals" value={stats?.activeHospitals || 0} icon={Activity} color="bg-green-500" />
              <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="bg-purple-500" />
            </>
          ) : (
            <>
              <StatCard title="Total Patients" value={stats?.totalPatients || 0} icon={Users} color="bg-blue-500" />
              <StatCard title="Total Doctors" value={stats?.totalDoctors || 0} icon={Stethoscope} color="bg-green-500" />
              <StatCard title="Today's Appointments" value={stats?.todayAppointments || 0} icon={Calendar} color="bg-yellow-500" />
              <StatCard title="Monthly Revenue" value={formatCurrency(stats?.monthlyRevenue)} icon={DollarSign} color="bg-purple-500" />
            </>
          )}
        </div>

        {!isSuperAdmin() && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Appointments (Last 7 Days)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Revenue (Last 6 Months)">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {stats?.recentActivities && (
          <Card title="Recent Activities">
            <div className="space-y-3">
              {stats.recentActivities.map((activity) => (
                <div key={activity._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{activity.action} - {activity.resource}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user?.firstName} {activity.user?.lastName}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDateTime(activity.createdAt)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
