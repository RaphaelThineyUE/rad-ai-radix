import { RadiologyReport } from '../../types';

type EvidenceEntry = {
  context: string;
  quote: string;
};

type ReportDetailProps = {
  report: RadiologyReport;
};

const normalizeEvidenceEntries = (report: RadiologyReport): EvidenceEntry[] => {
  const analysis = (report.ai_analysis ?? report) as Record<string, any>;
  const entries: EvidenceEntry[] = [];

  const pushEvidence = (context: string, evidence?: string[] | string) => {
    if (!evidence) return;
    const quotes = Array.isArray(evidence) ? evidence : [evidence];
    quotes
      .map((quote) => quote?.trim())
      .filter((quote): quote is string => Boolean(quote))
      .forEach((quote) => {
        entries.push({ context, quote });
      });
  };

  if (analysis.birads) {
    const biradsLabel = [
      'BI-RADS',
      analysis.birads.value !== undefined ? `Category ${analysis.birads.value}` : null
    ]
      .filter(Boolean)
      .join(' • ');
    pushEvidence(biradsLabel, analysis.birads.evidence);
  }

  if (analysis.breast_density) {
    const densityLabel = [
      'Breast Density',
      analysis.breast_density.value
    ]
      .filter(Boolean)
      .join(' • ');
    pushEvidence(densityLabel, analysis.breast_density.evidence);
  }

  if (analysis.exam) {
    const examLabel = [
      'Exam',
      analysis.exam.type,
      analysis.exam.laterality
    ]
      .filter(Boolean)
      .join(' • ');
    pushEvidence(examLabel, analysis.exam.evidence);
  }

  if (analysis.comparison) {
    const comparisonLabel = [
      'Comparison',
      analysis.comparison.prior_exam_date ? `Prior: ${analysis.comparison.prior_exam_date}` : null
    ]
      .filter(Boolean)
      .join(' • ');
    pushEvidence(comparisonLabel, analysis.comparison.evidence);
  }

  const findings = Array.isArray(analysis.findings) ? analysis.findings : [];
  findings.forEach((finding, index) => {
    const findingLabel = [
      `Finding ${index + 1}`,
      finding.laterality,
      finding.location,
      finding.assessment
    ]
      .filter(Boolean)
      .join(' • ');
    pushEvidence(findingLabel, finding.evidence);
  });

  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
  recommendations.forEach((recommendation, index) => {
    const recommendationLabel = [
      `Recommendation ${index + 1}`,
      recommendation.action,
      recommendation.timeframe ? `Timeframe: ${recommendation.timeframe}` : null
    ]
      .filter(Boolean)
      .join(' • ');
    pushEvidence(recommendationLabel, recommendation.evidence);
  });

  return entries;
};

export default function ReportDetail({ report }: ReportDetailProps) {
  const evidenceEntries = normalizeEvidenceEntries(report);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Evidence Quotes</h3>
          <span className="text-sm text-gray-500">AI extracted</span>
        </div>
        {evidenceEntries.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {evidenceEntries.map((entry, index) => (
              <li
                key={`${entry.context}-${index}`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="text-sm font-semibold text-gray-700">{entry.context}</div>
                <blockquote className="mt-2 text-gray-700 italic">
                  “{entry.quote}”
                </blockquote>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
            No evidence quotes are available for this report yet.
          </div>
        )}
      </div>
    </div>
  );
}
