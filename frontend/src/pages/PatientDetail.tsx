import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../lib/api';

type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

export default function PatientDetail() {
  const { id } = useParams();
  const [reportId, setReportId] = useState('');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastProcessedId, setLastProcessedId] = useState('');

  const isProcessing = processingStatus === 'processing';

  const handleProcessReport = async (event?: FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    if (!reportId.trim()) {
      return;
    }

    setProcessingStatus('processing');
    setErrorMessage('');
    setLastProcessedId('');

    try {
      await apiClient.processReport(reportId.trim());
      setLastProcessedId(reportId.trim());
      setProcessingStatus('completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Processing failed';
      setErrorMessage(message);
      setProcessingStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Patient Details
        </h2>
        <p className="text-gray-600">Patient ID: {id}</p>
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
