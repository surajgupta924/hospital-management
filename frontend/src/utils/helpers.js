import { format, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(typeof date === 'string' ? parseISO(date) : new Date(date), 'MMM dd, yyyy');
  } catch {
    return '-';
  }
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  try {
    return format(typeof date === 'string' ? parseISO(date) : new Date(date), 'MMM dd, yyyy HH:mm');
  } catch {
    return '-';
  }
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
};

export const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'Something went wrong';
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
