export type ReportCardProps = {
  patientName: string;
  reportDate: string;
  birads: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  status: string;
  onSelect?: () => void;
};

const biradsStyles: Record<ReportCardProps['birads'], string> = {
  0: 'bg-slate-100 text-slate-700 border-slate-200',
  1: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  2: 'bg-green-100 text-green-700 border-green-200',
  3: 'bg-amber-100 text-amber-700 border-amber-200',
  4: 'bg-orange-100 text-orange-700 border-orange-200',
  5: 'bg-red-100 text-red-700 border-red-200',
  6: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function ReportCard({
  patientName,
  reportDate,
  birads,
  status,
  onSelect,
}: ReportCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm',
        'p-5 transition hover:shadow-md hover:border-pink-200 focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Patient</p>
          <h4 className="text-lg font-semibold text-gray-900">{patientName}</h4>
        </div>
        <span
          className={[
            'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
            biradsStyles[birads],
          ].join(' ')}
        >
          BI-RADS {birads}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <div>
          <span className="font-medium text-gray-700">Report Date:</span>{' '}
          {reportDate}
        </div>
        <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {status}
        </div>
      </div>
    </button>
  );
}
