import * as billingService from '../services/billingService.js';
import * as pdfService from '../services/pdfService.js';
import Hospital from '../models/Hospital.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await billingService.createInvoice(req.hospitalId, req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, invoice, 'Invoice created'));
});

export const getInvoices = asyncHandler(async (req, res) => {
  const result = await billingService.getInvoices(req.hospitalId, req.query);
  res.json(new ApiResponse(200, result));
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await billingService.getInvoiceById(req.hospitalId, req.params.id);
  res.json(new ApiResponse(200, invoice));
});

export const updatePayment = asyncHandler(async (req, res) => {
  const invoice = await billingService.updatePaymentStatus(req.hospitalId, req.params.id, req.body, req.user, req);
  res.json(new ApiResponse(200, invoice, 'Payment updated'));
});

export const getRevenue = asyncHandler(async (req, res) => {
  const analytics = await billingService.getRevenueAnalytics(req.hospitalId, req.query);
  res.json(new ApiResponse(200, analytics));
});

export const downloadPDF = asyncHandler(async (req, res) => {
  const invoice = await billingService.getInvoiceById(req.hospitalId, req.params.id);
  const hospital = await Hospital.findById(req.hospitalId);
  const pdf = await pdfService.generateInvoicePDF(invoice, hospital);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
  res.send(pdf);
});
