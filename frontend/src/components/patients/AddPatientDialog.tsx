import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api';
import type { Patient } from '../../types';

const genderOptions: Array<Patient['gender']> = ['Male', 'Female', 'Other'];
const stageOptions: Array<Patient['cancer_stage']> = [
  'Stage 0',
  'Stage I',
  'Stage II',
  'Stage III',
  'Stage IV',
  'Unknown'
];
const receptorStatusOptions: Array<Patient['er_status']> = ['Positive', 'Negative', 'Unknown'];

type PatientFormValues = {
  full_name: string;
  date_of_birth: string;
  gender: Patient['gender'] | '';
  ethnicity?: string;
  diagnosis_date: string;
  cancer_type: string;
  cancer_stage: Patient['cancer_stage'];
  tumor_size_cm?: number;
  lymph_node_positive: boolean;
  er_status: Patient['er_status'];
  pr_status: Patient['pr_status'];
  her2_status: Patient['her2_status'];
  menopausal_status?: string;
  initial_treatment_plan?: string;
};

interface AddPatientDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (patient: Patient) => void;
}

export default function AddPatientDialog({ open, onClose, onCreated }: AddPatientDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PatientFormValues>({
    defaultValues: {
      gender: '',
      cancer_stage: 'Unknown',
      lymph_node_positive: false,
      er_status: 'Unknown',
      pr_status: 'Unknown',
      her2_status: 'Unknown'
    }
  });

  const onSubmit = handleSubmit(async data => {
    setSubmitting(true);
    try {
      const patient = await apiClient.createPatient({
        ...data,
        gender: data.gender || undefined
      });
      toast.success('Patient created successfully.');
      reset();
      onCreated?.(patient);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Unable to create patient.');
    } finally {
      setSubmitting(false);
    }
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add patient</h2>
            <p className="text-sm text-gray-500">Capture clinical details for the new record.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 px-6 py-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Patient details</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Full name
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Jane Doe"
                  {...register('full_name', { required: 'Full name is required' })}
                />
                {errors.full_name && (
                  <span className="mt-1 block text-xs text-red-500">{errors.full_name.message}</span>
                )}
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Date of birth
                <input
                  type="date"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  {...register('date_of_birth', { required: 'Date of birth is required' })}
                />
                {errors.date_of_birth && (
                  <span className="mt-1 block text-xs text-red-500">{errors.date_of_birth.message}</span>
                )}
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Gender
                <select
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  {...register('gender', { required: 'Gender is required' })}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  {genderOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <span className="mt-1 block text-xs text-red-500">{errors.gender.message}</span>
                )}
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Ethnicity
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Optional"
                  {...register('ethnicity')}
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Diagnosis</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Diagnosis date
                <input
                  type="date"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  {...register('diagnosis_date', { required: 'Diagnosis date is required' })}
                />
                {errors.diagnosis_date && (
                  <span className="mt-1 block text-xs text-red-500">{errors.diagnosis_date.message}</span>
                )}
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Cancer type
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g. Breast carcinoma"
                  {...register('cancer_type', { required: 'Cancer type is required' })}
                />
                {errors.cancer_type && (
                  <span className="mt-1 block text-xs text-red-500">{errors.cancer_type.message}</span>
                )}
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Cancer stage
                <select
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  {...register('cancer_stage')}
                >
                  {stageOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Tumor size (cm)
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Optional"
                  {...register('tumor_size_cm', {
                    min: { value: 0, message: 'Tumor size must be zero or greater' },
                    setValueAs: value => (value === '' ? undefined : Number(value))
                  })}
                />
                {errors.tumor_size_cm && (
                  <span className="mt-1 block text-xs text-red-500">{errors.tumor_size_cm.message}</span>
                )}
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Receptor status</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block text-sm font-medium text-gray-700">
                ER status
                <select
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  {...register('er_status')}
                >
                  {receptorStatusOptions.map(option => (
                    <option key={`er-${option}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                PR status
                <select
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  {...register('pr_status')}
                >
                  {receptorStatusOptions.map(option => (
                    <option key={`pr-${option}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-gray-700">
                HER2 status
                <select
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  {...register('her2_status')}
                >
                  {receptorStatusOptions.map(option => (
                    <option key={`her2-${option}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Treatment context</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Menopausal status
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Optional"
                  {...register('menopausal_status')}
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">
                <input type="checkbox" className="h-4 w-4 rounded" {...register('lymph_node_positive')} />
                Lymph node positive
              </label>

              <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                Initial treatment plan
                <textarea
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Optional"
                  {...register('initial_treatment_plan')}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-5 py-2 text-sm font-medium text-white transition hover:from-pink-700 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Create patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
