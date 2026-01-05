/**
 * Represents the possible status values for a biomarker test result.
 */
export type BiomarkerStatus = 'positive' | 'negative' | 'unknown';

const BASE_BADGE_CLASSES =
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold';

/**
 * Central mapping of biomarker status values to their display properties.
 * This serves as the single source of truth for biomarker status presentation across the application.
 * 
 * Each status maps to:
 * - `label`: Human-readable text for display
 * - `classes`: Tailwind CSS classes for badge styling
 * 
 * @constant
 * @type {Record<BiomarkerStatus, { label: string; classes: string }>}
 * 
 * @example
 * ```tsx
 * const status: BiomarkerStatus = 'positive';
 * const { label, classes } = biomarkerStatusMap[status];
 * return <span className={classes}>{label}</span>;
 * ```
 */
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

/**
 * Retrieves the human-readable label for a given biomarker status.
 * 
 * @param {BiomarkerStatus} status - The biomarker status to get the label for
 * @returns {string} The display label (e.g., 'Positive', 'Negative', 'Unknown')
 * 
 * @example
 * ```tsx
 * const label = getBiomarkerStatusLabel('positive'); // Returns 'Positive'
 * ```
 */
export const getBiomarkerStatusLabel = (status: BiomarkerStatus) =>
  biomarkerStatusMap[status].label;

/**
 * Retrieves the Tailwind CSS classes for styling a biomarker status badge.
 * 
 * @param {BiomarkerStatus} status - The biomarker status to get the classes for
 * @returns {string} A string of Tailwind CSS classes for badge styling
 * 
 * @example
 * ```tsx
 * const classes = getBiomarkerStatusClasses('negative');
 * return <span className={classes}>Negative</span>;
 * ```
 */
export const getBiomarkerStatusClasses = (status: BiomarkerStatus) =>
  biomarkerStatusMap[status].classes;
