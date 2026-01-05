import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/api';
import type { Patient } from '../types';

interface AddPatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (patient: Patient) => void;
}

const stageOptions: Patient['cancer_stage'][] = [
  'Unknown',
  'Stage 0',
  'Stage I',
  'Stage II',
  'Stage III',
  'Stage IV'
];

export default function AddPatientDialog({ isOpen, onClose, onCreated }: AddPatientDialogProps) {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Patient['gender']>('Female');
  const [diagnosisDate, setDiagnosisDate] = useState('');
  const [cancerType, setCancerType] = useState('');
  const [cancerStage, setCancerStage] = useState<Patient['cancer_stage']>('Unknown');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return Boolean(fullName.trim() && dateOfBirth && diagnosisDate && cancerType.trim());
  }, [fullName, dateOfBirth, diagnosisDate, cancerType]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.request<Patient>('/patients', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName.trim(),
          date_of_birth: dateOfBirth,
          gender,
          diagnosis_date: diagnosisDate,
          cancer_type: cancerType.trim(),
          cancer_stage: cancerStage
        })
      });

      onCreated(response);
      onClose();
      setFullName('');
      setDateOfBirth('');
      setGender('Female');
      setDiagnosisDate('');
      setCancerType('');
      setCancerStage('Unknown');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to create patient.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Add patient</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-gray-700">
              Full name
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                placeholder="Jane Doe"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700">
              Date of birth
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700">
              Gender
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value as Patient['gender'])}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700">
              Diagnosis date
              <input
                type="date"
                value={diagnosisDate}
                onChange={(event) => setDiagnosisDate(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700">
              Cancer type
              <input
                type="text"
                value={cancerType}
                onChange={(event) => setCancerType(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
                placeholder="Invasive ductal carcinoma"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-gray-700">
              Cancer stage
              <select
                value={cancerStage}
                onChange={(event) => setCancerStage(event.target.value as Patient['cancer_stage'])}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
              >
                {stageOptions.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
