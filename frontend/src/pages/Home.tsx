import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ConfirmDialog from '../components/ConfirmDialog';
import { apiClient } from '../lib/api';
import type { RadiologyReport } from '../types';

export default function Home() {
  const [reports, setReports] = useState<RadiologyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<RadiologyReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalReports = reports.length;

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const { reports: fetchedReports } = await apiClient.getReports();
      setReports(fetchedReports);
    } catch (error) {
      toast.error(error.message || 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const reportStats = useMemo(() => {
    const analyzedCount = reports.filter(report => report.ai_analysis).length;
    return {
      analyzedCount,
      needsReviewCount: totalReports - analyzedCount
    };
  }, [reports, totalReports]);

  const handleDelete = async () => {
    if (!selectedReport) {
      return;
    }

    const previousReports = reports;
    setIsDeleting(true);
    setReports(prev => prev.filter(report => report._id !== selectedReport._id));

    try {
      await apiClient.deleteReport(selectedReport._id);
      toast.success('Report deleted');
      setSelectedReport(null);
    } catch (error) {
      setReports(previousReports);
      toast.error(error.message || 'Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

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

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Upload a report</h3>
          <p className="text-sm text-gray-500">
            Select a PDF or image file and track upload progress in real time.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Choose file
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isUploading ? 'Uploading...' : 'Upload report'}
          </button>
        </div>

        {selectedFile ? (
          <div className="text-sm text-gray-600">
            Selected: <span className="font-medium">{selectedFile.name}</span>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{isUploading ? 'Uploading file…' : 'Upload progress'}</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>

        {uploadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {uploadError}
          </div>
        ) : null}

        {uploadSuccess ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {uploadSuccess}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-pink-600 mb-2">{totalReports}</div>
          <div className="text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {reportStats.analyzedCount}
          </div>
          <div className="text-gray-600">Analyzed</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {reportStats.needsReviewCount}
          </div>
          <div className="text-gray-600">Needs Review</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Reports
        </h3>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No reports yet. Upload your first report to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div
                key={report._id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="text-sm text-gray-500">
                    {new Date(report.report_date).toLocaleDateString()}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {report.report_type}
                  </div>
                  <div className="text-sm text-gray-600">
                    Patient ID: {report.patient_id}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {report.ai_analysis ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Analyzed
                    </span>
                  ) : (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                      Needs review
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(selectedReport)}
        title="Delete report?"
        description="This action cannot be undone. The report will be removed permanently."
        confirmLabel="Delete report"
        isConfirming={isDeleting}
        onCancel={() => setSelectedReport(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
