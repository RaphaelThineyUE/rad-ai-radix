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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to RadReport AI
        </h2>
        <p className="text-gray-600">
          Upload and analyze breast radiology reports with AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-pink-600 mb-2">0</div>
          <div className="text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">0</div>
          <div className="text-gray-600">Analyzed</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
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
        <div className="text-center py-12 text-gray-500">
          No reports yet. Upload your first report to get started.
        </div>
      </div>
    </div>
  );
}
