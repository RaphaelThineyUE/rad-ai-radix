import { X } from 'lucide-react';

import { getBiradsColorClass } from '../../lib/birads';

interface ReportDetailProps {
  report: {
    filename?: string;
    birads?: {
      value?: number | null;
      label?: string;
    };
    summary?: string;
    findings?: string;
    recommendations?: string;
  };
  onClose?: () => void;
}

export default function ReportDetail({ report, onClose }: ReportDetailProps) {
  const biradsValue = report.birads?.value;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {report.filename ?? 'Report details'}
            </h2>
            {biradsValue != null && (
              <span
                className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getBiradsColorClass(
                  biradsValue
                )}`}
              >
                BI-RADS {biradsValue}
                {report.birads?.label ? ` — ${report.birads.label}` : ''}
              </span>
            )}
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close report details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {report.summary && (
            <section>
              <h3 className="text-sm font-semibold uppercase text-gray-500">
                Summary
              </h3>
              <p className="mt-2 text-sm text-gray-700">{report.summary}</p>
            </section>
          )}

          {report.findings && (
            <section>
              <h3 className="text-sm font-semibold uppercase text-gray-500">
                Findings
              </h3>
              <p className="mt-2 text-sm text-gray-700">{report.findings}</p>
            </section>
          )}

          {report.recommendations && (
            <section>
              <h3 className="text-sm font-semibold uppercase text-gray-500">
                Recommendations
              </h3>
              <p className="mt-2 text-sm text-gray-700">
                {report.recommendations}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
