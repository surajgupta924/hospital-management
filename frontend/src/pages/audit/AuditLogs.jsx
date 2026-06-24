import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import { dashboardAPI } from '../../api/services';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const { data } = await dashboardAPI.getAuditLogs({ page });
        setLogs(data.data.items);
        setPagination(data.data.pagination);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

  const columns = [
    { key: 'action', label: 'Action' },
    { key: 'resource', label: 'Resource' },
    { key: 'user', label: 'User', render: (row) => row.user ? `${row.user.firstName} ${row.user.lastName}` : '-' },
    { key: 'role', label: 'Role', render: (row) => row.user?.role || '-' },
    { key: 'ip', label: 'IP', render: (row) => row.ipAddress || '-' },
    { key: 'date', label: 'Date', render: (row) => formatDateTime(row.createdAt) },
  ];

  return (
    <div>
      <Header title="Audit Logs" subtitle="Track all important system actions" />
      <div className="p-6">
        <Card>
          <DataTable columns={columns} data={logs} loading={loading} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      </div>
    </div>
  );
};

export default AuditLogs;
