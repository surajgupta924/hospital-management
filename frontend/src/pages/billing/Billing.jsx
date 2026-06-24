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
import Badge from '../../components/ui/Badge';
import { billingAPI, patientAPI } from '../../api/services';
import { PAYMENT_STATUS } from '../../utils/constants';
import { formatCurrency, formatDate, getErrorMessage, downloadBlob } from '../../utils/helpers';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patient: '', items: [{ description: '', quantity: 1, unitPrice: 0 }] });
  const [submitting, setSubmitting] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await billingAPI.getAll({ page });
      setInvoices(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    patientAPI.getAll({ limit: 100 }).then((r) => setPatients(r.data.data.items));
  }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await billingAPI.create({
        patient: form.patient,
        items: form.items.map((i) => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
      });
      toast.success('Invoice created');
      setShowModal(false);
      fetchInvoices();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (id) => {
    try {
      await billingAPI.updatePayment(id, { paymentStatus: 'paid', paidAmount: 0 });
      toast.success('Payment recorded');
      fetchInvoices();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDownload = async (id, number) => {
    try {
      const { data } = await billingAPI.downloadPDF(id);
      downloadBlob(data, `invoice-${number}.pdf`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const columns = [
    { key: 'number', label: 'Invoice #', render: (row) => row.invoiceNumber },
    { key: 'patient', label: 'Patient', render: (row) => `${row.patient?.firstName} ${row.patient?.lastName}` },
    { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'status', label: 'Status', render: (row) => {
      const s = PAYMENT_STATUS[row.paymentStatus];
      return <Badge variant={s?.color}>{s?.label}</Badge>;
    }},
    { key: 'date', label: 'Date', render: (row) => formatDate(row.createdAt) },
    { key: 'actions', label: 'Actions', render: (row) => (
      <div className="flex gap-1">
        <Button variant="secondary" className="!px-2 !py-1" onClick={() => handleDownload(row._id, row.invoiceNumber)}>
          <Download className="h-4 w-4" />
        </Button>
        {row.paymentStatus === 'pending' && (
          <Button className="!px-2 !py-1 text-xs" onClick={() => handlePayment(row._id)}>Mark Paid</Button>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <Header title="Billing" subtitle="Invoices and payment management" />
      <div className="p-6">
        <Card action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" />Create Invoice</Button>}>
          <DataTable columns={columns} data={invoices} loading={loading} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Invoice" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Patient" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} placeholder="Select patient" required
            options={patients.map((p) => ({ value: p._id, label: `${p.firstName} ${p.lastName}` }))} />
          <Input label="Description" value={form.items[0].description} onChange={(e) => {
            const items = [...form.items];
            items[0].description = e.target.value;
            setForm({ ...form, items });
          }} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" value={form.items[0].quantity} onChange={(e) => {
              const items = [...form.items];
              items[0].quantity = e.target.value;
              setForm({ ...form, items });
            }} />
            <Input label="Unit Price" type="number" value={form.items[0].unitPrice} onChange={(e) => {
              const items = [...form.items];
              items[0].unitPrice = e.target.value;
              setForm({ ...form, items });
            }} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create Invoice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Billing;
