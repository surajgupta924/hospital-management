import { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { pharmacyAPI } from '../../api/services';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';

const Pharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: 0, unitPrice: 0, sellingPrice: 0, reorderLevel: 10 });
  const [submitting, setSubmitting] = useState(false);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const [medRes, lowRes] = await Promise.all([
        pharmacyAPI.getAll({ page }),
        pharmacyAPI.getLowStock(),
      ]);
      setMedicines(medRes.data.data.items);
      setPagination(medRes.data.data.pagination);
      setLowStock(lowRes.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await pharmacyAPI.create({
        ...form,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        sellingPrice: Number(form.sellingPrice),
        reorderLevel: Number(form.reorderLevel),
      });
      toast.success('Medicine added');
      setShowModal(false);
      fetchMedicines();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Medicine' },
    { key: 'category', label: 'Category', render: (row) => row.category || '-' },
    { key: 'quantity', label: 'Stock', render: (row) => (
      <span className={row.quantity <= row.reorderLevel ? 'text-red-600 font-medium' : ''}>{row.quantity}</span>
    )},
    { key: 'reorderLevel', label: 'Reorder At' },
    { key: 'price', label: 'Price', render: (row) => formatCurrency(row.sellingPrice) },
    { key: 'status', label: 'Status', render: (row) => (
      row.quantity <= row.reorderLevel ? <Badge variant="red">Low Stock</Badge> : <Badge variant="green">In Stock</Badge>
    )},
  ];

  return (
    <div>
      <Header title="Pharmacy" subtitle="Medicine inventory and stock management" />
      <div className="p-6 space-y-6">
        {lowStock.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800"><strong>{lowStock.length}</strong> medicines are running low on stock</p>
          </div>
        )}
        <Card action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" />Add Medicine</Button>}>
          <DataTable columns={columns} data={medicines} loading={loading} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </Card>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Medicine">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <Input label="Reorder Level" type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Unit Price" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} required />
            <Input label="Selling Price" type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Pharmacy;
