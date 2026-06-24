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
import { appointmentAPI, doctorAPI, patientAPI } from '../../api/services';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { formatDate, getErrorMessage } from '../../utils/helpers';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', doctor: '', appointmentDate: '', startTime: '09:00', endTime: '09:30', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await appointmentAPI.getAll({ page });
      setAppointments(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    doctorAPI.getAll({ limit: 100 }).then((r) => setDoctors(r.data.data.items));
    patientAPI.getAll({ limit: 100 }).then((r) => setPatients(r.data.data.items));
  }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentAPI.create(form);
      toast.success('Appointment booked');
      setShowModal(false);
      fetchAppointments();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await appointmentAPI.cancel(id, 'Cancelled by user');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const columns = [
    { key: 'patient', label: 'Patient', render: (row) => `${row.patient?.firstName} ${row.patient?.lastName}` },
    { key: 'doctor', label: 'Doctor', render: (row) => `Dr. ${row.doctor?.user?.firstName} ${row.doctor?.user?.lastName}` },
    { key: 'date', label: 'Date', render: (row) => formatDate(row.appointmentDate) },
    { key: 'time', label: 'Time', render: (row) => `${row.startTime} - ${row.endTime}` },
    { key: 'status', label: 'Status', render: (row) => {
      const s = APPOINTMENT_STATUS[row.status];
      return <Badge variant={s?.color}>{s?.label || row.status}</Badge>;
    }},
    { key: 'actions', label: 'Actions', render: (row) => row.status !== 'cancelled' && (
      <Button variant="danger" className="!px-2 !py-1 text-xs" onClick={() => handleCancel(row._id)}>Cancel</Button>
    )},
  ];

  return (
    <div>
      <Header title="Appointments" subtitle="Book and manage appointments" />
      <div className="p-6">
        <Card action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" />Book Appointment</Button>}>
          <DataTable columns={columns} data={appointments} loading={loading} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Book Appointment" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Patient" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} placeholder="Select patient" required
            options={patients.map((p) => ({ value: p._id, label: `${p.firstName} ${p.lastName} (${p.patientId})` }))} />
          <Select label="Doctor" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} placeholder="Select doctor" required
            options={doctors.map((d) => ({ value: d._id, label: `Dr. ${d.user?.firstName} ${d.user?.lastName} - ${d.specialization}` }))} />
          <Input label="Date" type="date" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            <Input label="End Time" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
          </div>
          <Input label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Book</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
