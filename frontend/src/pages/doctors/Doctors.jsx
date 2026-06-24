import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { doctorAPI } from '../../api/services';
import { getErrorMessage } from '../../utils/helpers';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: 'Admin@12345',
    specialization: '', qualification: '', consultationFee: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const { data } = await doctorAPI.getAll({ page, search });
      setDoctors(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, [page, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await doctorAPI.create({ ...form, consultationFee: Number(form.consultationFee) });
      toast.success('Doctor added');
      setShowModal(false);
      fetchDoctors();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => `Dr. ${row.user?.firstName} ${row.user?.lastName}` },
    { key: 'email', label: 'Email', render: (row) => row.user?.email },
    { key: 'specialization', label: 'Specialization' },
    { key: 'department', label: 'Department', render: (row) => row.department?.name || '-' },
    { key: 'fee', label: 'Fee', render: (row) => `$${row.consultationFee}` },
    { key: 'status', label: 'Status', render: (row) => (
      <span className={row.isAvailable ? 'text-green-600' : 'text-red-600'}>{row.isAvailable ? 'Available' : 'Unavailable'}</span>
    )},
  ];

  return (
    <div>
      <Header title="Doctors" subtitle="Manage hospital doctors" />
      <div className="p-6">
        <Card action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" />Add Doctor</Button>}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="mb-4 max-w-sm" />
          <DataTable columns={columns} data={doctors} loading={loading} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Doctor" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
          <Input label="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
          <Input label="Consultation Fee" type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Add Doctor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Doctors;
