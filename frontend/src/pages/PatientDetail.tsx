import { useParams } from 'react-router-dom';
import { useProcessReport } from '../hooks/useProcessReport';

export default function PatientDetail() {
  const { id } = useParams();
  const {
    reportId,
    setReportId,
    processingStatus,
    errorMessage,
    lastProcessedId,
    isProcessing,
    handleProcessReport,
  } = useProcessReport();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Patient Details
        </h2>
        {isLoading && (
          <p className="text-gray-500">Loading patient details...</p>
        )}
        {!isLoading && errorMessage && (
          <p className="text-red-600">{errorMessage}</p>
        )}
        {!isLoading && !errorMessage && patientDetail && (
          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-semibold text-gray-900">Name:</span>{' '}
              {patientDetail.patient.full_name || 'Unknown'}
            </p>
            {patientDetail.patient.mrn && (
              <p>
                <span className="font-semibold text-gray-900">MRN:</span>{' '}
                {patientDetail.patient.mrn}
              </p>
            )}
            <p>
              <span className="font-semibold text-gray-900">Patient ID:</span>{' '}
              {patientDetail.patient._id}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Date of Birth:</span>{' '}
              {formatDateValue(patientDetail.patient.date_of_birth)}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Upload Radiology Report
        </h3>
        <form className="space-y-4" onSubmit={handleUpload}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="report-upload">
              PDF Report
            </label>
            <input
              id="report-upload"
              type="file"
              accept="application/pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-700 hover:file:bg-pink-100"
            />
          </div>
          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex items-center justify-center rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-400"
          >
            {isUploading ? 'Uploading...' : 'Upload Report'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Process a Report</h3>
          <p id="report-id-description" className="text-gray-600">
            Provide a report ID to run AI processing for this patient.
          </p>
        </div>

        <form onSubmit={handleProcessReport} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label htmlFor="report-id-input" className="flex-1 text-sm font-medium text-gray-700">
            Report ID
            <input
              id="report-id-input"
              type="text"
              value={reportId}
              onChange={(event) => setReportId(event.target.value)}
              disabled={isProcessing}
              placeholder="e.g. 64f1c2..."
              aria-describedby="report-id-description"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:bg-gray-100"
            />
          </label>

          <button
            type="submit"
            disabled={isProcessing || reportId.trim().length === 0}
            className="inline-flex items-center justify-center rounded-xl bg-pink-600 px-4 py-2 text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-300"
          >
            {isProcessing ? 'Processing...' : 'Run AI Processing'}
          </button>
        </form>

        {isProcessing && (
          <div className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-700">
            Processing is running. Actions are disabled until it finishes.
          </div>
        )}

        {processingStatus === 'completed' && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Processing complete{lastProcessedId ? ` for report ${lastProcessedId}` : ''}. You can
            continue reviewing results.
          </div>
        )}

        {processingStatus === 'error' && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage || 'Processing failed. Please try again.'}
          </div>
        )}
      </div>
    </div>
  );
}
