import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { apiClient } from '../lib/api';
import type { TreatmentRecord } from '../types';

const STATUS_COLORS = ['#2563eb', '#10b981', '#f97316', '#a855f7', '#6b7280'];

const formatStatusLabel = (status: string) =>
  status
    .split(/[_-]/g)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

const isCompletedStatus = (status: string) => {
  const normalized = status.trim().toLowerCase();
  return normalized === 'completed' || normalized === 'complete' || normalized === 'closed';
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {statTotals.total}
          </div>
          <div className="text-gray-600">Total Treatments</div>
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
          <div className="text-gray-600">Pending Outcomes</div>
        </div>
      ) : null}

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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Outcomes by Status
              </h3>
              <p className="text-sm text-gray-500">
                Distribution of treatment outcomes across all patients.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="space-y-4 w-full max-w-md">
                <div className="h-48 w-48 mx-auto rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex justify-center gap-4">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="text-center py-12 text-red-500">{errorMessage}</div>
          ) : statusStats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No treatment outcomes yet. Add treatments to populate this chart.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {statusStats.map((entry, index) => (
                      <Cell
                        key={`status-cell-${entry.name}`}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} treatments`,
                      name
                    ]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Completion by Treatment Type
              </h3>
              <p className="text-sm text-gray-500">
                Compare completed vs total treatments by type.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="space-y-4 w-full px-6">
                <div className="flex items-end justify-around h-48">
                  <div className="h-32 w-16 bg-gray-200 rounded-t animate-pulse"></div>
                  <div className="h-40 w-16 bg-gray-200 rounded-t animate-pulse"></div>
                  <div className="h-24 w-16 bg-gray-200 rounded-t animate-pulse"></div>
                  <div className="h-36 w-16 bg-gray-200 rounded-t animate-pulse"></div>
                </div>
                <div className="flex justify-center gap-4">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="text-center py-12 text-red-500">{errorMessage}</div>
          ) : treatmentTypeStats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No treatment types available yet. Add treatments to see progress.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={treatmentTypeStats} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} treatments`,
                      name
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="total"
                    name="Total"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
