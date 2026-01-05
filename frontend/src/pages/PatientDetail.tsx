import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  getBiomarkerStatusClasses,
  getBiomarkerStatusLabel,
  type BiomarkerStatus,
} from '../lib/biomarkerStatus';

export default function PatientDetail() {
  const { id } = useParams();
  const biomarkerResults = useMemo(
    () =>
      [
        {
          name: 'HER2',
          status: 'positive',
          method: 'IHC 3+',
          collectedAt: '2024-01-22',
        },
        {
          name: 'PD-L1',
          status: 'negative',
          method: 'TPS <1%',
          collectedAt: '2024-01-22',
        },
        {
          name: 'ALK',
          status: 'unknown',
          method: 'Pending confirmatory FISH',
          collectedAt: '2024-01-24',
        },
        {
          name: 'EGFR',
          status: 'positive',
          method: 'Exon 19 del',
          collectedAt: '2024-01-22',
        },
      ] as const,
    [],
  );
  const biomarkerSummary = useMemo(() => {
    const summary = biomarkerResults.reduce(
      (acc, result) => {
        acc[result.status] += 1;
        return acc;
      },
      {
        positive: 0,
        negative: 0,
        unknown: 0,
      } as Record<BiomarkerStatus, number>,
    );

    return [
      { status: 'positive', count: summary.positive },
      { status: 'negative', count: summary.negative },
      { status: 'unknown', count: summary.unknown },
    ] as const;
  }, [biomarkerResults]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Patient Details
        </h2>
        <p className="text-gray-600">Patient ID: {id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Biomarker Results
            </h3>
            <span className="text-sm text-gray-500">
              {biomarkerResults.length} markers assessed
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Biomarker
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Collected
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {biomarkerResults.map((result) => (
                  <tr key={result.name}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {result.name}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={getBiomarkerStatusClasses(result.status)}
                      >
                        {getBiomarkerStatusLabel(result.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {result.method}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {result.collectedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Biomarker Summary
          </h3>
          <p className="text-sm text-gray-500">
            Consistent status badges are used across patient views and
            analytics.
          </p>
          <div className="space-y-3">
            {biomarkerSummary.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className={getBiomarkerStatusClasses(item.status)}>
                    {getBiomarkerStatusLabel(item.status)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Results recorded
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
