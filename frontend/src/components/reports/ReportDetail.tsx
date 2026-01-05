import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { RadiologyReport } from '../../types';

interface ReportDetailProps {
  report: RadiologyReport | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (value?: string) => {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const renderEvidence = (evidence?: string[]) => {
  if (!evidence || evidence.length === 0) {
    return <p className="text-sm text-gray-500">No evidence quotes provided.</p>;
  }

  return (
    <ul className="space-y-2">
      {evidence.map((quote, index) => (
        <li
          key={`${quote}-${index}`}
          className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-gray-700"
        >
          “{quote}”
        </li>
      ))}
    </ul>
  );
};

const renderFindings = (findings?: RadiologyReport['findings']) => {
  if (!findings || (Array.isArray(findings) && findings.length === 0)) {
    return <p className="text-sm text-gray-500">No findings available.</p>;
  }

  if (typeof findings === 'string') {
    return <p className="text-sm text-gray-700 whitespace-pre-line">{findings}</p>;
  }

  return (
    <div className="space-y-4">
      {findings.map((finding, index) => (
        <div key={`finding-${index}`} className="rounded-xl border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-800">
            {finding.laterality || 'Laterality unspecified'} ·{' '}
            {finding.location || 'Location unspecified'}
          </div>
          <div className="mt-2 text-sm text-gray-700">
            {finding.description || 'No description provided.'}
          </div>
          {finding.assessment && (
            <div className="mt-2 text-xs font-medium text-rose-600">
              Assessment: {finding.assessment}
            </div>
          )}
          <div className="mt-3">{renderEvidence(finding.evidence)}</div>
        </div>
      ))}
    </div>
  );
};

const renderRecommendations = (recommendations?: RadiologyReport['recommendations']) => {
  if (!recommendations || (Array.isArray(recommendations) && recommendations.length === 0)) {
    return <p className="text-sm text-gray-500">No recommendations available.</p>;
  }

  if (typeof recommendations === 'string') {
    return (
      <p className="text-sm text-gray-700 whitespace-pre-line">{recommendations}</p>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation, index) => (
        <div key={`recommendation-${index}`} className="rounded-xl border border-gray-200 p-4">
          <div className="text-sm font-semibold text-gray-800">
            {recommendation.action || 'Recommendation'}
          </div>
          {recommendation.timeframe && (
            <div className="mt-1 text-xs text-gray-500">
              Timeframe: {recommendation.timeframe}
            </div>
          )}
          <div className="mt-3">{renderEvidence(recommendation.evidence)}</div>
        </div>
      ))}
    </div>
  );
};

export default function ReportDetail({ report, isOpen, onClose }: ReportDetailProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl transform bg-white shadow-2xl transition-transform duration-300">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-rose-500">
                Report detail
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-900">
                {report.filename || report.report_type || 'Radiology report'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Report date: {formatDate(report.report_date)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:border-rose-200 hover:text-rose-600"
              aria-label="Close report detail"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">AI analysis</h3>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {report.summary || 'No summary provided yet.'}
                </p>
                {report.red_flags && report.red_flags.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-rose-600">Red flags</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                      {report.red_flags.map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">BI-RADS</h3>
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-700">
                  Category: {report.birads?.value ?? 'Not available'}
                </p>
                <p className="text-sm text-gray-500">
                  Confidence: {report.birads?.confidence ?? 'Not provided'}
                </p>
                <div className="mt-3">{renderEvidence(report.birads?.evidence)}</div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Breast density</h3>
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-sm text-gray-700">
                  Density: {report.breast_density?.value ?? 'Not available'}
                </p>
                <div className="mt-3">{renderEvidence(report.breast_density?.evidence)}</div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Findings</h3>
              {renderFindings(report.findings)}
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Recommendations
              </h3>
              {renderRecommendations(report.recommendations)}
            </section>

            {(report.exam || report.comparison) && (
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Exam details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      Exam
                    </p>
                    <p className="mt-2 text-sm text-gray-700">
                      {report.exam?.type || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Laterality: {report.exam?.laterality || 'Not specified'}
                    </p>
                    <div className="mt-3">{renderEvidence(report.exam?.evidence)}</div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                      Comparison
                    </p>
                    <p className="mt-2 text-sm text-gray-700">
                      Prior exam date:{' '}
                      {formatDate(report.comparison?.prior_exam_date)}
                    </p>
                    <div className="mt-3">{renderEvidence(report.comparison?.evidence)}</div>
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
            >
              Close report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
