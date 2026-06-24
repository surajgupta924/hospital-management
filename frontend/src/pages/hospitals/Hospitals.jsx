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
import { hospitalAPI } from '../../api/services';
import { formatDate, getErrorMessage } from '../../utils/helpers';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const { data } = await hospitalAPI.getAll({ page, search });
      setHospitals(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, [page, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await hospitalAPI.create(form);
      toast.success('Hospital created');
      setShowModal(false);
      fetchHospitals();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', render: (row) => (
      <span className={row.isActive ? 'text-green-600' : 'text-red-600'}>{row.isActive ? 'Active' : 'Inactive'}</span>
    )},
    { key: 'createdAt', label: 'Created', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div>
      <Header title="Hospitals" subtitle="Manage all hospitals on the platform" />
      <div className="p-6">
        <Card action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" />Add Hospital</Button>}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="mb-4 max-w-sm" />
          <DataTable columns={columns} data={hospitals} loading={loading} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Hospital">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Hospitals;
