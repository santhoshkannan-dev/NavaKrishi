export function formatINR(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === null || num === undefined || Number.isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num);
}

export function formatWithUnit(amount, unit) {
  const formatted = formatINR(amount);
  return unit ? `${formatted}/${unit}` : formatted;
}
