import Invoice from '../models/Invoice.js';
import ApiError from '../utils/ApiError.js';
import { PAYMENT_STATUS } from '../constants/status.js';
import { getPagination, buildPaginatedResponse, buildSort } from '../utils/pagination.js';
import { logAudit } from './auditService.js';

const generateInvoiceNumber = async (hospitalId) => {
  const count = await Invoice.countDocuments({ hospital: hospitalId });
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
};

export const createInvoice = async (hospitalId, data, user, req) => {
  const items = data.items.map((item) => ({
    ...item,
    quantity: item.quantity || 1,
    amount: (item.quantity || 1) * item.unitPrice,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = data.tax || 0;
  const discount = data.discount || 0;
  const total = subtotal + tax - discount;

  const invoice = await Invoice.create({
    hospital: hospitalId,
    patient: data.patient,
    appointment: data.appointment,
    invoiceNumber: await generateInvoiceNumber(hospitalId),
    items,
    subtotal,
    tax,
    discount,
    total,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    notes: data.notes,
    createdBy: user._id,
  });

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'CREATE',
    resource: 'Invoice',
    resourceId: invoice._id,
    req,
  });

  return Invoice.findById(invoice._id).populate('patient', 'firstName lastName patientId');
};

export const getInvoices = async (hospitalId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { hospital: hospitalId };

  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.patient) filter.patient = query.patient;

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate('patient', 'firstName lastName patientId')
      .sort(buildSort(query.sortBy || 'createdAt', query.order || 'desc'))
      .skip(skip)
      .limit(limit),
    Invoice.countDocuments(filter),
  ]);

  return buildPaginatedResponse(invoices, total, page, limit);
};

export const getInvoiceById = async (hospitalId, id) => {
  const invoice = await Invoice.findOne({ _id: id, hospital: hospitalId })
    .populate('patient')
    .populate('appointment');
  if (!invoice) throw new ApiError(404, 'Invoice not found');
  return invoice;
};

export const updatePaymentStatus = async (hospitalId, id, data, user, req) => {
  const invoice = await Invoice.findOne({ _id: id, hospital: hospitalId });
  if (!invoice) throw new ApiError(404, 'Invoice not found');

  invoice.paymentStatus = data.paymentStatus;
  invoice.paidAmount = data.paidAmount ?? invoice.paidAmount;
  invoice.paymentMethod = data.paymentMethod || invoice.paymentMethod;

  if (data.paymentStatus === PAYMENT_STATUS.PAID) {
    invoice.paidAt = new Date();
    invoice.paidAmount = invoice.total;
  }

  await invoice.save();

  await logAudit({
    hospital: hospitalId,
    user,
    action: 'UPDATE',
    resource: 'Invoice',
    resourceId: invoice._id,
    details: data,
    req,
  });

  return invoice;
};

export const getRevenueAnalytics = async (hospitalId, query) => {
  const match = { hospital: hospitalId, paymentStatus: PAYMENT_STATUS.PAID };

  if (query.startDate || query.endDate) {
    match.paidAt = {};
    if (query.startDate) match.paidAt.$gte = new Date(query.startDate);
    if (query.endDate) match.paidAt.$lte = new Date(query.endDate);
  }

  const [summary, monthly] = await Promise.all([
    Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalInvoices: { $sum: 1 },
          avgInvoice: { $avg: '$total' },
        },
      },
    ]),
    Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const pending = await Invoice.aggregate([
    { $match: { hospital: hospitalId, paymentStatus: PAYMENT_STATUS.PENDING } },
    { $group: { _id: null, amount: { $sum: '$total' }, count: { $sum: 1 } } },
  ]);

  return {
    summary: summary[0] || { totalRevenue: 0, totalInvoices: 0, avgInvoice: 0 },
    monthly,
    pending: pending[0] || { amount: 0, count: 0 },
  };
};
