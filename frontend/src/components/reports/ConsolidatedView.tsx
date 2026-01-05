import { useState } from 'react';
import { apiClient } from '../../lib/api';

type ConsolidatedPayload = {
  consolidated_summary?: string;
  overall_assessment?: string;
  progression_notes?: string;
  key_patterns?: string[];
  report_count?: number;
  date_range?: {
    first?: string;
    last?: string;
  };
};

type ConsolidatedViewProps = {
  patientId: string;
  reportCount: number;
};

const formatDate = (value?: string) => {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

export default function ConsolidatedView({ patientId, reportCount }: ConsolidatedViewProps) {
  const [data, setData] = useState<ConsolidatedPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConsolidate = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.consolidateReports(patientId);
      setData(response as ConsolidatedPayload);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to consolidate reports right now.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Consolidated Report View</h3>
          <p className="text-sm text-gray-500">
            {reportCount} completed report{reportCount === 1 ? '' : 's'} available for
            consolidation.
          </p>
        </div>
        <button
          type="button"
          onClick={handleConsolidate}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-300"
        >
          {isLoading ? 'Consolidating...' : 'Consolidate reports'}
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!data && !isLoading && !errorMessage && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
          Run the consolidation to view combined findings, patterns, and progression.
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-400">Report span</p>
              <p className="text-sm font-medium text-gray-700">
                {formatDate(data.date_range?.first)} → {formatDate(data.date_range?.last)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-400">Report count</p>
              <p className="text-sm font-medium text-gray-700">
                {data.report_count ?? reportCount} reports consolidated
              </p>
            </div>
          </div>

          {data.consolidated_summary && (
            <div className="rounded-xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Consolidated summary</h4>
              <p className="mt-2 text-sm text-gray-600">{data.consolidated_summary}</p>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Overall assessment</h4>
              <p className="mt-2 text-sm text-gray-600">
                {data.overall_assessment || 'No overall assessment provided.'}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Progression notes</h4>
              <p className="mt-2 text-sm text-gray-600">
                {data.progression_notes || 'No progression notes provided.'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <h4 className="text-sm font-semibold text-gray-900">Key patterns</h4>
            {data.key_patterns && data.key_patterns.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                {data.key_patterns.map((pattern) => (
                  <li key={pattern}>{pattern}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-600">No key patterns provided.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
