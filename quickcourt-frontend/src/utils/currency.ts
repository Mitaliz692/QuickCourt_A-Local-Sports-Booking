// Currency formatting utility for Indian Rupees (INR)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format currency with decimals for more precise values
export const formatCurrencyDetailed = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format large numbers in Indian numbering system (Lakhs, Crores)
export const formatIndianNumber = (amount: number): string => {
  if (amount >= 10000000) { // 1 Crore
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) { // 1 Lakh
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (amount >= 1000) { // 1 Thousand
    return `₹${(amount / 1000).toFixed(1)} K`;
  } else {
    return `₹${amount.toFixed(0)}`;
  }
};

// Format currency for chart tooltips
export const formatChartCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default {
  formatCurrency,
  formatCurrencyDetailed,
  formatIndianNumber,
  formatChartCurrency,
};
