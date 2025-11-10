const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BAM',
  }).format(amount);
};

export default formatCurrency;
