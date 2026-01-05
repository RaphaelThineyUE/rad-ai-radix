import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../lib/api';
import type { TreatmentRecord } from '../../types';

interface TreatmentComparisonProps {
  patientId?: string;
}

type ComparisonResponse = Record<string, unknown> | null;

type TreatmentResponse = TreatmentRecord[] | { treatments: TreatmentRecord[] };

const MAX_TREATMENT_OPTIONS = 5;

const formatTreatmentOption = (treatment: TreatmentRecord): string => {
  const startDate = treatment.start_date || (treatment as TreatmentRecord & { treatment_start_date?: string }).treatment_start_date;
  const dateLabel = startDate ? ` (started ${new Date(startDate).toLocaleDateString()})` : '';
  return `${treatment.treatment_type}${dateLabel}`;
};

export default function TreatmentComparison({ patientId }: TreatmentComparisonProps) {
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false);
  const [treatmentsError, setTreatmentsError] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse>(null);

  useEffect(() => {
    if (!patientId) {
      setTreatments([]);
      return;
    }

    let isMounted = true;
    const fetchTreatments = async () => {
      setIsLoadingTreatments(true);
      setTreatmentsError(null);

      try {
        const params = new URLSearchParams({ patient_id: patientId });
        const response = await apiClient.request<TreatmentResponse>(`/treatments?${params}`);
        const data = Array.isArray(response) ? response : response.treatments;

        if (isMounted) {
          setTreatments(data ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setTreatmentsError('Unable to load treatments. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingTreatments(false);
        }
      }
    };

    fetchTreatments();

    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const treatmentOptions = useMemo(
    () => treatments.map((treatment) => ({
      id: treatment._id,
      label: formatTreatmentOption(treatment),
      value: formatTreatmentOption(treatment)
    })),
    [treatments]
  );

  const handleToggleOption = (option: string) => {
    setSelectedOptions((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      }

      if (prev.length >= MAX_TREATMENT_OPTIONS) {
        return prev;
      }

      return [...prev, option];
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!patientId || selectedOptions.length === 0) {
      return;
    }

    setIsComparing(true);
    setComparisonError(null);

    try {
      const response = await apiClient.compareTreatments(patientId, selectedOptions);
      setComparisonResult(response.comparison ?? response);
    } catch (error) {
      setComparisonError('Unable to compare treatments. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  const isSubmitDisabled = !patientId || selectedOptions.length === 0 || isComparing;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">AI Treatment Comparison</h3>
        <p className="text-sm text-gray-500">
          Select up to {MAX_TREATMENT_OPTIONS} treatment options to compare outcomes.
        </p>
      </div>

      {!patientId && (
        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
          Select a patient to load treatment options.
        </div>
      )}

      {patientId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {isLoadingTreatments && (
              <div className="text-sm text-gray-500">Loading treatment options...</div>
            )}

            {treatmentsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {treatmentsError}
              </div>
            )}

            {!isLoadingTreatments && !treatmentsError && treatmentOptions.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                No treatments found for this patient. Add treatments to enable comparison.
              </div>
            )}

            {!isLoadingTreatments && treatmentOptions.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {treatmentOptions.map((option) => {
                  const isChecked = selectedOptions.includes(option.value);
                  const isDisabled = !isChecked && selectedOptions.length >= MAX_TREATMENT_OPTIONS;

                  return (
                    <label
                      key={option.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-sm transition ${
                        isChecked
                          ? 'border-blue-200 bg-blue-50 text-blue-900'
                          : 'border-gray-200 text-gray-600'
                      } ${isDisabled ? 'opacity-60' : 'cursor-pointer hover:border-blue-200'}`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={isChecked}
                        onChange={() => handleToggleOption(option.value)}
                        disabled={isDisabled}
                      />
                      <span>
                        <span className="font-medium text-gray-900">{option.label}</span>
                        <span className="block text-xs text-gray-500">Treatment option</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isComparing ? 'Comparing...' : 'Compare Treatments'}
            </button>
            <span className="text-xs text-gray-500">
              Selected {selectedOptions.length} / {MAX_TREATMENT_OPTIONS}
            </span>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {comparisonError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {comparisonError}
          </div>
        )}

        {comparisonResult && !comparisonError && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">AI Comparison Result</h4>
            <pre className="whitespace-pre-wrap text-xs text-gray-700">
              {JSON.stringify(comparisonResult, null, 2)}
            </pre>
          </div>
        )}

        {isComparing && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
            Generating AI comparison...
          </div>
        )}
      </div>
    </div>
  );
}
