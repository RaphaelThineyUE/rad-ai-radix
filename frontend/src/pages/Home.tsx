import { useEffect, useMemo, useState } from 'react';
import ReportDetail from '../components/reports/ReportDetail';
import { apiClient } from '../lib/api';
import type { RadiologyReport } from '../types';

export default function Home() {
  const [reports, setReports] = useState<RadiologyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<RadiologyReport | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      try {
        const data = await apiClient.getReports();
        if (isMounted) {
          setReports(data.reports ?? []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load reports right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReports();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = reports.length;
    const analyzed = reports.filter((report) => report.status === 'completed').length;
    const needsReview = reports.filter((report) => report.status === 'failed').length;
    return { total, analyzed, needsReview };
  }, [reports]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to RadReport AI
        </h2>
        <p className="text-gray-600">
          Upload and analyze breast radiology reports with AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-pink-600 mb-2">
            {stats.total}
          </div>
          <div className="text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.analyzed}
          </div>
          <div className="text-gray-600">Analyzed</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {stats.needsReview}
          </div>
          <div className="text-gray-600">Needs Review</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Recent Reports</h3>
          <span className="text-sm text-gray-500">
            {reports.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading reports...</div>
        ) : error ? (
          <div className="text-center py-12 text-rose-600">{error}</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No reports yet. Upload your first report to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((report) => (
              <div
                key={report._id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-rose-500 uppercase tracking-[0.15em]">
                    {report.status || 'pending'}
                  </p>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {report.filename || report.report_type || 'Radiology report'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Report date: {report.report_date || 'Not provided'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(report)}
                  className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  View details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportDetail
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
