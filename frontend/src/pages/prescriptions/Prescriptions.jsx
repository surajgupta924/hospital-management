import { useEffect, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { prescriptionAPI, patientAPI } from '../../api/services';
import { formatDate, getErrorMessage, downloadBlob } from '../../utils/helpers';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    patient: '', diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const { data } = await prescriptionAPI.getAll({ page });
      setPrescriptions(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    patientAPI.getAll({ limit: 100 }).then((r) => setPatients(r.data.data.items));
  }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await prescriptionAPI.create(form);
      toast.success('Prescription created');
      setShowModal(false);
      fetchPrescriptions();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (id, number) => {
    try {
      const { data } = await prescriptionAPI.downloadPDF(id);
      downloadBlob(data, `prescription-${number}.pdf`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const columns = [
    { key: 'number', label: '#', render: (row) => row.prescriptionNumber },
    { key: 'patient', label: 'Patient', render: (row) => `${row.patient?.firstName} ${row.patient?.lastName}` },
    { key: 'doctor', label: 'Doctor', render: (row) => `Dr. ${row.doctor?.user?.firstName} ${row.doctor?.user?.lastName}` },
    { key: 'diagnosis', label: 'Diagnosis', render: (row) => row.diagnosis || '-' },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <Button variant="secondary" className="!px-2 !py-1" onClick={() => handleDownload(row._id, row.prescriptionNumber)}>
        <Download className="h-4 w-4" />
      </Button>
    )},
  ];

  return (
    <div>
      <Header title="Prescriptions" subtitle="Create and manage prescriptions" />
      <div className="p-6">
        <Card action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" />New Prescription</Button>}>
          <DataTable columns={columns} data={prescriptions} loading={loading} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Prescription" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Patient" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} placeholder="Select patient" required
            options={patients.map((p) => ({ value: p._id, label: `${p.firstName} ${p.lastName}` }))} />
          <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          <div className="border rounded-lg p-4 space-y-3">
            <p className="font-medium text-sm">Medicine</p>
            <Input label="Name" value={form.medicines[0].name} onChange={(e) => {
              const meds = [...form.medicines];
              meds[0].name = e.target.value;
              setForm({ ...form, medicines: meds });
            }} required />
            <div className="grid grid-cols-3 gap-3">
              <Input label="Dosage" value={form.medicines[0].dosage} onChange={(e) => { const meds = [...form.medicines]; meds[0].dosage = e.target.value; setForm({ ...form, medicines: meds }); }} required />
              <Input label="Frequency" value={form.medicines[0].frequency} onChange={(e) => { const meds = [...form.medicines]; meds[0].frequency = e.target.value; setForm({ ...form, medicines: meds }); }} required />
              <Input label="Duration" value={form.medicines[0].duration} onChange={(e) => { const meds = [...form.medicines]; meds[0].duration = e.target.value; setForm({ ...form, medicines: meds }); }} required />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Prescriptions;
