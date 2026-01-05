import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import ConsolidatedView from '../components/reports/ConsolidatedView';
import { apiClient } from '../lib/api';
import type { RadiologyReport } from '../types';

export default function PatientDetail() {
  const { id } = useParams();
  const [reports, setReports] = useState<RadiologyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const reportCount = useMemo(() => reports.length, [reports.length]);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      if (!id) {
        setReportsLoading(false);
        return;
      }

      setReportsLoading(true);
      setReportsError(null);

      try {
        const response = await apiClient.getReports({ patient_id: id, status: 'completed' });
        const payload = response as unknown;
        const normalizedReports = Array.isArray(payload)
          ? payload
          : ((payload as { reports?: RadiologyReport[] })?.reports ?? []);

        if (isMounted) {
          setReports(normalizedReports);
        }
      } catch (error) {
        if (isMounted) {
          setReportsError(
            error instanceof Error
              ? error.message
              : 'Unable to load reports for this patient.'
          );
        }
      } finally {
        if (isMounted) {
          setReportsLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Patient Details
        </h2>
        <p className="text-gray-600">Patient ID: {id}</p>
        <div className="mt-4 text-sm text-gray-500">
          {reportsLoading && 'Loading reports...'}
          {!reportsLoading && reportsError && reportsError}
          {!reportsLoading && !reportsError && (
            <span>{reportCount} completed report{reportCount === 1 ? '' : 's'}</span>
          )}
        </div>
      </div>

      {!reportsLoading && !reportsError && reportCount >= 2 && id && (
        <ConsolidatedView patientId={id} reportCount={reportCount} />
      )}
    </div>
  );
}
