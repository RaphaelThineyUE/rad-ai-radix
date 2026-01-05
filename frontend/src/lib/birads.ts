export const getBiradsColorClass = (value?: number | null): string => {
  if (value == null || Number.isNaN(value)) {
    return 'bg-gray-100 text-gray-800';
  }

  if (value === 0) {
    return 'bg-slate-100 text-slate-800';
  }

  if (value <= 2) {
    return 'bg-green-100 text-green-900';
  }

  if (value === 3) {
    return 'bg-yellow-100 text-yellow-900';
  }

  if (value === 4) {
    return 'bg-orange-100 text-orange-900';
  }

  return 'bg-red-100 text-red-900';
};
