import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import PatientForm from '../components/patients/PatientForm';
import { apiClient } from '../lib/api';
import type { Patient } from '../types';

const formatDate = (value?: string) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  const time = date.getTime();

  if (Number.isNaN(time)) {
    return value;
  }

  return date.toLocaleDateString();
};

export default function PatientList() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiClient.getPatients()
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Patient>) => apiClient.createPatient(payload),
    onSuccess: async () => {
      toast.success('Patient created successfully');
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowForm(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Unable to create patient');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <p className="text-gray-600">Track and manage your patient roster.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(prev => !prev)}
          className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition"
        >
          {showForm ? 'Close Form' : 'Add Patient'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Patient</h3>
          <PatientForm
            onSubmit={payload => createMutation.mutate(payload)}
            submitLabel="Create Patient"
            loading={createMutation.isPending}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {isLoading && <div className="text-center text-gray-500">Loading patients...</div>}
        {isError && (
          <div className="text-center text-red-600">Unable to load patients.</div>
        )}
        {!isLoading && !isError && patients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No patients yet. Add your first patient to get started.
          </div>
        )}
        {!isLoading && !isError && patients.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {patients.map(patient => (
              <Link
                key={patient._id}
                to={`/patients/${patient._id}`}
                className="block border border-gray-200 rounded-xl p-4 hover:border-pink-500 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {patient.full_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Diagnosis: {patient.cancer_type} ({patient.cancer_stage})
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-gray-500">
                    {patient.gender}
                  </span>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p>Date of Birth: {formatDate(patient.date_of_birth)}</p>
                  <p>Diagnosis Date: {formatDate(patient.diagnosis_date)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <AddPatientDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
