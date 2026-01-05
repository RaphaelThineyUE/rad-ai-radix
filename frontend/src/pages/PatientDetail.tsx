import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  getBiomarkerStatusClasses,
  getBiomarkerStatusLabel,
  type BiomarkerStatus,
} from '../lib/biomarkerStatus';

export default function PatientDetail() {
  const { id } = useParams();
  const [showEdit, setShowEdit] = useState(false);
  const queryClient = useQueryClient();

  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => apiClient.getPatient(id as string),
    enabled: Boolean(id)
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Patient>) => apiClient.updatePatient(id as string, payload),
    onSuccess: async updated => {
      toast.success('Patient updated successfully');
      queryClient.setQueryData(['patient', id], updated);
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowEdit(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Unable to update patient');
    }
  });

  const formDefaults = useMemo(() => {
    if (!patient) return undefined;
    return {
      full_name: patient.full_name,
      date_of_birth: toDateInput(patient.date_of_birth),
      gender: patient.gender,
      ethnicity: patient.ethnicity ?? '',
      diagnosis_date: toDateInput(patient.diagnosis_date),
      cancer_type: patient.cancer_type,
      cancer_stage: patient.cancer_stage,
      tumor_size_cm: patient.tumor_size_cm ?? '',
      lymph_node_positive: patient.lymph_node_positive,
      er_status: patient.er_status,
      pr_status: patient.pr_status,
      her2_status: patient.her2_status,
      menopausal_status: patient.menopausal_status ?? '',
      initial_treatment_plan: patient.initial_treatment_plan ?? ''
    };
  }, [patient]);

  const formatDateOffset = (daysOffset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().slice(0, 10);
  };

  const biomarkerResults = useMemo(
    () => {
      const twoDaysAgo = formatDateOffset(-2);
      const oneDayAgo = formatDateOffset(-1);
      const today = formatDateOffset(0);

      return [
        {
          name: 'HER2',
          status: 'positive',
          method: 'IHC 3+',
          collectedAt: twoDaysAgo,
        },
        {
          name: 'PD-L1',
          status: 'negative',
          method: 'TPS <1%',
          collectedAt: twoDaysAgo,
        },
        {
          name: 'ALK',
          status: 'unknown',
          method: 'Pending confirmatory FISH',
          collectedAt: oneDayAgo,
        },
        {
          name: 'EGFR',
          status: 'positive',
          method: 'Exon 19 del',
          collectedAt: today,
        },
      ] as const;
    },
    [],
  );
  const biomarkerSummary = useMemo(() => {
    const summary = biomarkerResults.reduce(
      (acc, result) => {
        acc[result.status] += 1;
        return acc;
      },
      {
        positive: 0,
        negative: 0,
        unknown: 0,
      } as Record<BiomarkerStatus, number>,
    );

    return [
      { status: 'positive', count: summary.positive },
      { status: 'negative', count: summary.negative },
      { status: 'unknown', count: summary.unknown },
    ] as const;
  }, [biomarkerResults]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
          <p className="text-gray-600">Review the patient profile and clinical info.</p>
        </div>
        {patient && (
          <button
            type="button"
            onClick={() => setShowEdit(prev => !prev)}
            className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition"
          >
            {showEdit ? 'Close Edit' : 'Edit Patient'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {isLoading && <div className="text-center text-gray-500">Loading patient...</div>}
        {isError && <div className="text-center text-red-600">Unable to load patient.</div>}
        {!isLoading && !isError && patient && (
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{patient.full_name}</h3>
                  <p className="text-sm text-gray-600">{patient.gender}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Date of Birth: {formatDate(patient.date_of_birth)}</p>
                  <p>Diagnosis Date: {formatDate(patient.diagnosis_date)}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                <p>
                  <span className="font-medium">Cancer Type:</span> {patient.cancer_type}
                </p>
                <p>
                  <span className="font-medium">Stage:</span> {patient.cancer_stage}
                </p>
                <p>
                  <span className="font-medium">Tumor Size:</span>{' '}
                  {patient.tumor_size_cm ? `${patient.tumor_size_cm} cm` : '—'}
                </p>
                <p>
                  <span className="font-medium">Lymph Node Positive:</span>{' '}
                  {patient.lymph_node_positive ? 'Yes' : 'No'}
                </p>
                <p>
                  <span className="font-medium">ER Status:</span> {patient.er_status}
                </p>
                <p>
                  <span className="font-medium">PR Status:</span> {patient.pr_status}
                </p>
                <p>
                  <span className="font-medium">HER2 Status:</span> {patient.her2_status}
                </p>
                <p>
                  <span className="font-medium">Ethnicity:</span> {patient.ethnicity || '—'}
                </p>
                <p>
                  <span className="font-medium">Menopausal Status:</span>{' '}
                  {patient.menopausal_status || '—'}
                </p>
              </div>
              {patient.initial_treatment_plan && (
                <div className="mt-4">
                  <p className="font-medium text-gray-900">Initial Treatment Plan</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {patient.initial_treatment_plan}
                  </p>
                </div>
              )}
            </div>

            {showEdit && (
              <div className="border border-pink-200 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Edit Patient</h4>
                <PatientForm
                  defaultValues={formDefaults}
                  onSubmit={payload => updateMutation.mutate(payload)}
                  submitLabel="Update Patient"
                  loading={updateMutation.isPending}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Biomarker Results
            </h3>
            <span className="text-sm text-gray-500">
              {biomarkerResults.length} markers assessed
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Biomarker
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Collected
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {biomarkerResults.map((result) => (
                  <tr key={result.name}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {result.name}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={getBiomarkerStatusClasses(result.status)}
                      >
                        {getBiomarkerStatusLabel(result.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {result.method}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {result.collectedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Biomarker Summary
          </h3>
          <p className="text-sm text-gray-500">
            Consistent status badges are used across patient views and
            analytics.
          </p>
          <div className="space-y-3">
            {biomarkerSummary.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className={getBiomarkerStatusClasses(item.status)}>
                    {getBiomarkerStatusLabel(item.status)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Results recorded
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
