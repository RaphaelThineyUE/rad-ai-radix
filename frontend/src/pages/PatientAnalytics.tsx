import { useEffect, useMemo, useState } from 'react';

import { apiClient } from '../lib/api';
import type { Patient, RadiologyReport, TreatmentRecord } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

type Trend = {
  direction: 'up' | 'down' | 'flat';
  value?: number;
  label: string;
};

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

const getDateValue = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const getTrend = (current: number, previous: number): Trend => {
  if (previous === 0 && current === 0) {
    return { direction: 'flat', value: 0, label: 'No change vs prior 30d' };
  }

  if (previous === 0) {
    return { direction: 'up', label: 'New activity in last 30d' };
  }

  const delta = ((current - previous) / previous) * 100;
  if (delta === 0) {
    return { direction: 'flat', value: 0, label: 'No change vs prior 30d' };
  }

  return {
    direction: delta > 0 ? 'up' : 'down',
    value: Math.abs(delta),
    label: 'vs prior 30d'
  };
};

const TrendIndicator = ({ trend }: { trend: Trend }) => {
  const directionStyles = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-rose-600 bg-rose-50',
    flat: 'text-gray-500 bg-gray-100'
  } as const;

  const directionSymbol = {
    up: '▲',
    down: '▼',
    flat: '▬'
  } as const;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${directionStyles[trend.direction]}`}>
        <span>{directionSymbol[trend.direction]}</span>
        <span>
          {trend.value === undefined ? 'New' : `${trend.value.toFixed(0)}%`}
        </span>
      </span>
      <span>{trend.label}</span>
    </div>
  );
};

export default function PatientAnalytics() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<RadiologyReport[]>([]);
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [patientsResponse, reportsResponse, treatmentsResponse] = await Promise.all([
          apiClient.getPatients(),
          apiClient.getReports(),
          apiClient.getTreatments()
        ]);

        const normalizeList = <T,>(
          data: { [key: string]: T[] } | T[] | undefined
        ): T[] => {
          if (!data) return [];
          if (Array.isArray(data)) return data;
          return Object.values(data)[0] ?? [];
        };

        if (!isMounted) return;

        setPatients(normalizeList(patientsResponse as { patients?: Patient[] } | Patient[]));
        setReports(normalizeList(reportsResponse as { reports?: RadiologyReport[] } | RadiologyReport[]));
        setTreatments(normalizeList(treatmentsResponse as { treatments?: TreatmentRecord[] } | TreatmentRecord[]));
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load analytics data.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const now = Date.now();
    const recentStart = now - WINDOW_DAYS * DAY_MS;
    const previousStart = now - WINDOW_DAYS * 2 * DAY_MS;

    const countInWindow = <T,>(items: T[], getDate: (item: T) => number | null, start: number, end: number) =>
      items.filter((item) => {
        const timestamp = getDate(item);
        return timestamp !== null && timestamp >= start && timestamp < end;
      }).length;

    const patientDate = (patient: Patient) =>
      getDateValue(patient.created_date ?? patient.createdAt);
    const reportDate = (report: RadiologyReport) =>
      getDateValue(report.report_date ?? report.created_date ?? report.createdAt);
    const treatmentDate = (treatment: TreatmentRecord) =>
      getDateValue(treatment.start_date ?? treatment.created_date ?? treatment.createdAt);

    const totalPatients = patients.length;
    const totalReports = reports.length;

    const activeTreatments = treatments.filter((treatment) => {
      const status = treatment.status?.toLowerCase();
      if (status && ['completed', 'inactive', 'ended'].includes(status)) {
        return false;
      }
      const endDate = getDateValue(treatment.end_date);
      if (endDate && endDate <= now) {
        return false;
      }
      return status ? ['active', 'ongoing', 'in-progress'].includes(status) : !treatment.end_date;
    });

    const multiReportCount = Object.values(
      reports.reduce<Record<string, number>>((acc, report) => {
        acc[report.patient_id] = (acc[report.patient_id] || 0) + 1;
        return acc;
      }, {})
    ).filter((count) => count > 1).length;

    const recentPatientCount = countInWindow(patients, patientDate, recentStart, now);
    const previousPatientCount = countInWindow(patients, patientDate, previousStart, recentStart);
    const recentReportCount = countInWindow(reports, reportDate, recentStart, now);
    const previousReportCount = countInWindow(reports, reportDate, previousStart, recentStart);
    const recentActiveTreatmentCount = countInWindow(activeTreatments, treatmentDate, recentStart, now);
    const previousActiveTreatmentCount = countInWindow(activeTreatments, treatmentDate, previousStart, recentStart);

    const avgReportsPerPatient = totalPatients > 0 ? totalReports / totalPatients : 0;
    const recentAvgReports = totalPatients > 0 ? recentReportCount / totalPatients : 0;
    const previousAvgReports = totalPatients > 0 ? previousReportCount / totalPatients : 0;

    return [
      {
        title: 'Total Patients',
        value: formatNumber(totalPatients),
        accent: 'text-blue-600',
        helper: `${formatNumber(multiReportCount)} patients with multiple reports`,
        trend: getTrend(recentPatientCount, previousPatientCount)
      },
      {
        title: 'Total Reports',
        value: formatNumber(totalReports),
        accent: 'text-purple-600',
        helper: `${formatNumber(recentReportCount)} reports added in last 30d`,
        trend: getTrend(recentReportCount, previousReportCount)
      },
      {
        title: 'Avg Reports / Patient',
        value: avgReportsPerPatient.toFixed(1),
        accent: 'text-emerald-600',
        helper: `Across ${formatNumber(totalPatients)} patients`,
        trend: getTrend(recentAvgReports, previousAvgReports)
      },
      {
        title: 'Active Treatments',
        value: formatNumber(activeTreatments.length),
        accent: 'text-orange-600',
        helper: `${formatNumber(activeTreatments.length)} ongoing plans`,
        trend: getTrend(recentActiveTreatmentCount, previousActiveTreatmentCount)
      }
    ];
  }, [patients, reports, treatments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500">
            Consolidated insights across all patient reports.
          </p>
        </div>
        {loading ? (
          <span className="text-sm text-gray-500">Refreshing metrics...</span>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
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

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Demographics Overview
        </h3>
        <div className="text-center py-12 text-gray-500">
          {loading ? 'Loading patient trends...' : 'No data available yet. Add patients to see analytics.'}
        </div>
      </div>
    </div>
  );
}
