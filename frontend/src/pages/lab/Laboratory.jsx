import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { labAPI, doctorAPI, patientAPI } from '../../api/services';
import { LAB_STATUS } from '../../utils/constants';
import { formatDate, getErrorMessage } from '../../utils/helpers';

const Laboratory = () => {
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', doctor: '', testName: '', testType: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await labAPI.getAll({ page });
      setReports(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    doctorAPI.getAll({ limit: 100 }).then((r) => setDoctors(r.data.data.items));
    patientAPI.getAll({ limit: 100 }).then((r) => setPatients(r.data.data.items));
  }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await labAPI.create(form);
      toast.success('Lab test requested');
      setShowModal(false);
      fetchReports();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'testNumber', label: 'Test #' },
    { key: 'patient', label: 'Patient', render: (row) => `${row.patient?.firstName} ${row.patient?.lastName}` },
    { key: 'testName', label: 'Test' },
    { key: 'status', label: 'Status', render: (row) => {
      const s = LAB_STATUS[row.status];
      return <Badge variant={s?.color}>{s?.label}</Badge>;
    }},
    { key: 'date', label: 'Requested', render: (row) => formatDate(row.requestedDate) },
  ];

  return (
    <div>
      <Header title="Laboratory" subtitle="Lab test requests and reports" />
      <div className="p-6">
        <Card action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" />Request Test</Button>}>
          <DataTable columns={columns} data={reports} loading={loading} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Request Lab Test">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Patient" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} placeholder="Select patient" required
            options={patients.map((p) => ({ value: p._id, label: `${p.firstName} ${p.lastName}` }))} />
          <Select label="Doctor" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} placeholder="Select doctor" required
            options={doctors.map((d) => ({ value: d._id, label: `Dr. ${d.user?.firstName} ${d.user?.lastName}` }))} />
          <Input label="Test Name" value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} required />
          <Input label="Test Type" value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Laboratory;
