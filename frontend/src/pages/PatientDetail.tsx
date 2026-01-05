import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import PatientForm from '../components/patients/PatientForm';
import { apiClient } from '../lib/api';
import type { Patient } from '../types';

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const toDateInput = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

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
    </div>
  );
}
