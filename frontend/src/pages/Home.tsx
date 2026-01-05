import { useReducer, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../lib/api';

type ProcessingState = {
  status: 'idle' | 'processing' | 'success' | 'error';
  errorMessage?: string;
};

type ProcessingAction =
  | { type: 'start' }
  | { type: 'success' }
  | { type: 'error'; message: string }
  | { type: 'reset' };

const initialProcessingState: ProcessingState = {
  status: 'idle'
};

function processingReducer(
  state: ProcessingState,
  action: ProcessingAction
): ProcessingState {
  switch (action.type) {
    case 'start':
      return { status: 'processing' };
    case 'success':
      return { status: 'success' };
    case 'error':
      return { status: 'error', errorMessage: action.message };
    case 'reset':
      return { status: 'idle' };
    default:
      return state;
  }
}

export default function Home() {
  const [reportText, setReportText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<Record<string, unknown> | null>(null);
  const [processingState, dispatch] = useReducer(
    processingReducer,
    initialProcessingState
  );

  const isProcessing = processingState.status === 'processing';

  const handleAnalyze = async () => {
    if (!reportText.trim()) {
      toast.error('Please paste a radiology report before analyzing.');
      return;
    }

    dispatch({ type: 'start' });
    setAnalysisResult(null);

    try {
      const response = await apiClient.analyzeReport(reportText.trim());
      setAnalysisResult(response.analysis);
      dispatch({ type: 'success' });
      toast.success('AI analysis complete!');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'AI analysis failed';
      dispatch({ type: 'error', message });
      toast.error(message);
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

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            AI Report Analysis
          </h3>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {isProcessing ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>
        <textarea
          value={reportText}
          onChange={(event) => {
            setReportText(event.target.value);
            if (processingState.status !== 'idle') {
              dispatch({ type: 'reset' });
            }
          }}
          disabled={isProcessing}
          rows={6}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:bg-gray-100"
          placeholder="Paste radiology report text here to generate AI insights."
        />
        <p className="text-xs text-gray-500">
          {processingState.status === 'error'
            ? processingState.errorMessage
            : processingState.status === 'processing'
            ? 'Analyzing report with AI...'
            : processingState.status === 'success'
            ? 'Analysis complete. Review the AI findings below.'
            : 'Enter a radiology report above and click "Run AI Analysis" to get started.'}
        </p>
        {analysisResult ? (
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            <div className="font-semibold text-gray-900 mb-2">
              Analysis Output
            </div>
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No AI analysis yet. Paste a report and run AI analysis to see
            results.
          </div>
        )}
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
