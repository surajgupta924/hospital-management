import PDFDocument from 'pdfkit';

const streamToBuffer = (doc) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });

export const generatePrescriptionPDF = async (prescription, hospital) => {
  const doc = new PDFDocument({ margin: 50 });
  const patient = prescription.patient;
  const doctor = prescription.doctor;

  doc.fontSize(20).text(hospital?.name || 'Hospital', { align: 'center' });
  doc.fontSize(14).text('PRESCRIPTION', { align: 'center' });
  doc.moveDown();

  doc.fontSize(10);
  doc.text(`Prescription #: ${prescription.prescriptionNumber}`);
  doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  doc.text(`Patient: ${patient.firstName} ${patient.lastName} (${patient.patientId})`);
  doc.text(`Doctor: Dr. ${doctor?.user?.firstName || ''} ${doctor?.user?.lastName || ''}`);
  if (prescription.diagnosis) doc.text(`Diagnosis: ${prescription.diagnosis}`);
  doc.moveDown();

  doc.fontSize(12).text('Medicines:', { underline: true });
  doc.moveDown(0.5);

  prescription.medicines.forEach((med, i) => {
    doc.fontSize(10).text(`${i + 1}. ${med.name}`);
    doc.text(`   Dosage: ${med.dosage} | Frequency: ${med.frequency} | Duration: ${med.duration}`);
    if (med.instructions) doc.text(`   Instructions: ${med.instructions}`);
    doc.moveDown(0.3);
  });

  if (prescription.notes) {
    doc.moveDown();
    doc.text(`Notes: ${prescription.notes}`);
  }

  if (prescription.followUpDate) {
    doc.moveDown();
    doc.text(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString()}`);
  }

  doc.moveDown(2);
  doc.text('_________________________', { align: 'right' });
  doc.text('Doctor Signature', { align: 'right' });

  return streamToBuffer(doc);
};

export const generateInvoicePDF = async (invoice, hospital) => {
  const doc = new PDFDocument({ margin: 50 });
  const patient = invoice.patient;

  doc.fontSize(20).text(hospital?.name || 'Hospital', { align: 'center' });
  doc.fontSize(14).text('INVOICE', { align: 'center' });
  doc.moveDown();

  doc.fontSize(10);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
  doc.text(`Status: ${invoice.paymentStatus.toUpperCase()}`);
  doc.moveDown();

  doc.text(`Patient: ${patient.firstName} ${patient.lastName} (${patient.patientId})`);
  doc.moveDown();

  doc.fontSize(12).text('Items:', { underline: true });
  doc.moveDown(0.5);

  invoice.items.forEach((item, i) => {
    doc.fontSize(10).text(
      `${i + 1}. ${item.description} - Qty: ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${item.amount.toFixed(2)}`
    );
  });

  doc.moveDown();
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, { align: 'right' });
  if (invoice.tax) doc.text(`Tax: $${invoice.tax.toFixed(2)}`, { align: 'right' });
  if (invoice.discount) doc.text(`Discount: -$${invoice.discount.toFixed(2)}`, { align: 'right' });
  doc.fontSize(12).text(`Total: $${invoice.total.toFixed(2)}`, { align: 'right' });

  return streamToBuffer(doc);
};
