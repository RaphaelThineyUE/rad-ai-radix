import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/api';
import {
  getBiomarkerStatusClasses,
  getBiomarkerStatusLabel,
  type BiomarkerStatus,
} from '../lib/biomarkerStatus';
import type { TreatmentRecord } from '../types';

const biomarkerStatusTotals: Array<{
  status: BiomarkerStatus;
  count: number;
  description: string;
}> = [
  {
    status: 'positive',
    count: 18,
    description: 'Markers guiding targeted therapy selection.',
  },
  {
    status: 'negative',
    count: 11,
    description: 'Markers with no detected expression.',
  },
  {
    status: 'unknown',
    count: 6,
    description: 'Results awaiting confirmation or rerun.',
  },
];

type TrendDirection = 'up' | 'down' | 'flat';

type MetricCard = {
  title: string;
  value: string;
  helper: string;
  accent: string;
  trend: TrendDirection;
};

const COMPLETED_STATUS_TOKENS = ['complete', 'completed', 'done', 'finished', 'resolved'];

const isCompletedStatus = (status: string) => {
  const normalized = status.toLowerCase();
  return COMPLETED_STATUS_TOKENS.some((token) => normalized.includes(token));
};

const formatStatusLabel = (status: string) =>
  status
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const TrendIndicator = ({ trend }: { trend: TrendDirection }) => {
  const trendMap: Record<TrendDirection, { label: string; className: string }> = {
    up: { label: 'Upward trend', className: 'text-emerald-600' },
    down: { label: 'Downward trend', className: 'text-rose-600' },
    flat: { label: 'Stable', className: 'text-gray-500' },
  };

  const trendInfo = trendMap[trend];

  return <span className={`text-xs font-semibold ${trendInfo.className}`}>{trendInfo.label}</span>;
};

export default function PatientAnalytics() {
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTreatments = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getTreatments();
        if (isMounted) {
          setTreatments(response.treatments || []);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error('Failed to load treatments', error);
        if (isMounted) {
          setErrorMessage('Unable to load treatment outcomes right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTreatments();

    return () => {
      isMounted = false;
    };
  }, []);

  const statusStats = useMemo(() => {
    const counts = treatments.reduce<Record<string, number>>((acc, treatment) => {
      const statusLabel = treatment.status?.trim() ? treatment.status.trim() : 'Unknown';
      acc[statusLabel] = (acc[statusLabel] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({
      name: formatStatusLabel(name),
      value
    }));
  }, [treatments]);

  const treatmentTypeStats = useMemo(() => {
    const counts = treatments.reduce<
      Record<string, { name: string; total: number; completed: number }>
    >((acc, treatment) => {
      const typeLabel = treatment.treatment_type?.trim() || 'Unspecified';
      if (!acc[typeLabel]) {
        acc[typeLabel] = { name: typeLabel, total: 0, completed: 0 };
      }
      acc[typeLabel].total += 1;
      if (treatment.status && isCompletedStatus(treatment.status)) {
        acc[typeLabel].completed += 1;
      }
      return acc;
    }, {});

    return Object.values(counts);
  }, [treatments]);

  const statTotals = useMemo(() => {
    const activeCount = treatments.filter((treatment) => {
      const normalized = treatment.status?.toLowerCase() ?? '';
      return normalized.includes('active') || normalized.includes('progress');
    }).length;

    const completedCount = treatments.filter((treatment) =>
      treatment.status ? isCompletedStatus(treatment.status) : false
    ).length;

    const pendingCount = treatments.filter((treatment) => {
      const normalized = treatment.status?.toLowerCase() ?? '';
      return normalized.includes('pending') || normalized.includes('scheduled');
    }).length;

    return {
      total: treatments.length,
      active: activeCount,
      completed: completedCount,
      pending: pendingCount
    };
  }, [treatments]);

  const totalPatients = useMemo(() => {
    const uniqueIds = new Set<string>();
    treatments.forEach((treatment) => {
      if (treatment.patient_id) {
        uniqueIds.add(treatment.patient_id);
      }
    });
    return uniqueIds.size;
  }, [treatments]);

  const metrics = useMemo<MetricCard[]>(() => {
    const completionRate =
      statTotals.total === 0 ? 0 : Math.round((statTotals.completed / statTotals.total) * 100);

    const topStatus = statusStats.reduce<{ name: string; value: number } | null>(
      (current, entry) => {
        if (!current || entry.value > current.value) {
          return entry;
        }
        return current;
      },
      null
    );

    const topStatusShare =
      topStatus && statTotals.total > 0
        ? Math.round((topStatus.value / statTotals.total) * 100)
        : 0;

    const topTreatment = treatmentTypeStats.reduce<
      { name: string; total: number; completed: number } | null
    >((current, entry) => {
      if (!current || entry.total > current.total) {
        return entry;
      }
      return current;
    }, null);

    const completionSignal: TrendDirection =
      completionRate >= 70 ? 'up' : completionRate >= 40 ? 'flat' : 'down';

    const durationValues = treatments
      .map((treatment) => {
        if (!treatment.start_date || !treatment.end_date) {
          return null;
        }
        const start = new Date(treatment.start_date).getTime();
        const end = new Date(treatment.end_date).getTime();
        if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
          return null;
        }
        return Math.round((end - start) / (1000 * 60 * 60 * 24));
      })
      .filter((value): value is number => value !== null);

    const averageDuration =
      durationValues.length > 0
        ? Math.round(durationValues.reduce((sum, value) => sum + value, 0) / durationValues.length)
        : null;

    return [
      {
        title: 'Completion rate',
        value: `${completionRate}%`,
        helper: 'Treatments marked complete',
        accent: 'text-emerald-600',
        trend: completionSignal,
      },
      {
        title: 'Most common status',
        value: topStatus ? topStatus.name : 'N/A',
        helper: topStatus ? `${topStatusShare}% of treatments` : 'No status data yet',
        accent: 'text-blue-600',
        trend: 'flat',
      },
      {
        title: 'Top treatment type',
        value: topTreatment ? topTreatment.name : 'N/A',
        helper: topTreatment ? `${topTreatment.total} recorded` : 'No treatment types yet',
        accent: 'text-purple-600',
        trend: 'flat',
      },
      {
        title: 'Avg treatment duration',
        value: averageDuration ? `${averageDuration} days` : 'N/A',
        helper: averageDuration ? 'From start to end' : 'Need completed treatments',
        accent: 'text-orange-600',
        trend: 'flat',
      },
    ];
  }, [statTotals, statusStats, treatmentTypeStats, treatments]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500">
            Track treatment outcomes and completion trends.
          </p>
        </div>
        {isLoading && <span className="text-sm text-gray-400">Loading...</span>}
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {totalPatients}
          </div>
          <div className="text-gray-600">Total Patients</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {statTotals.active}
          </div>
          <div className="text-gray-600">Active Treatments</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {statTotals.completed}
          </div>
          <div className="text-gray-600">Completed Treatments</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {statTotals.pending}
          </div>
          <div className="text-gray-600">Pending Treatments</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white rounded-xl shadow-md p-6 space-y-3">
            <div className="text-sm font-semibold text-gray-500">{metric.title}</div>
            <div className={`text-3xl font-bold ${metric.accent}`}>{metric.value}</div>
            <div className="text-xs text-gray-500">{metric.helper}</div>
            <TrendIndicator trend={metric.trend} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Biomarker Status Overview
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {biomarkerStatusTotals.map((item) => (
            <div
              key={item.status}
              className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-5"
            >
              <div className="flex items-center justify-between">
                <span className={getBiomarkerStatusClasses(item.status)}>
                  {getBiomarkerStatusLabel(item.status)}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {item.count}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
