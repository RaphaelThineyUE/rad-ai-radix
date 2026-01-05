export type BiomarkerStatus = 'positive' | 'negative' | 'unknown';

const BASE_BADGE_CLASSES =
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold';

export const biomarkerStatusMap: Record<
  BiomarkerStatus,
  { label: string; classes: string }
> = {
  positive: {
    label: 'Positive',
    classes: `${BASE_BADGE_CLASSES} border-emerald-200 bg-emerald-100 text-emerald-800`,
  },
  negative: {
    label: 'Negative',
    classes: `${BASE_BADGE_CLASSES} border-rose-200 bg-rose-100 text-rose-800`,
  },
  unknown: {
    label: 'Unknown',
    classes: `${BASE_BADGE_CLASSES} border-slate-200 bg-slate-100 text-slate-700`,
  },
};

export const getBiomarkerStatusLabel = (status: BiomarkerStatus) =>
  biomarkerStatusMap[status].label;

export const getBiomarkerStatusClasses = (status: BiomarkerStatus) =>
  biomarkerStatusMap[status].classes;
