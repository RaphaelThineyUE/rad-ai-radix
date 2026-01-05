import { useState, type ChangeEvent } from 'react';

import { apiClient } from '../lib/api';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) {
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      await apiClient.uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      setUploadSuccess(`Uploaded ${selectedFile.name} successfully.`);
      setSelectedFile(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
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
