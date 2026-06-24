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
import Select from '../../components/ui/Select';
import { patientAPI } from '../../api/services';
import { formatDate, getErrorMessage } from '../../utils/helpers';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', gender: '', dateOfBirth: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data } = await patientAPI.getAll({ page, search });
      setPatients(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, [page, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await patientAPI.create(form);
      toast.success('Patient registered');
      setShowModal(false);
      fetchPatients();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'patientId', label: 'ID' },
    { key: 'name', label: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email', render: (row) => row.email || '-' },
    { key: 'gender', label: 'Gender', render: (row) => row.gender || '-' },
    { key: 'dob', label: 'DOB', render: (row) => formatDate(row.dateOfBirth) },
  ];

  return (
    <div>
      <Header title="Patients" subtitle="Patient registration and management" />
      <div className="p-6">
        <Card action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" />Register Patient</Button>}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, ID, phone..." className="mb-4 max-w-sm" />
          <DataTable columns={columns} data={patients} loading={loading} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register Patient" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} placeholder="Select gender"
              options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
            <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Register</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Patients;
