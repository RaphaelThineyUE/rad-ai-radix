import { type ChangeEvent, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import type { Patient } from '../types';

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' }
];

export default function PatientList() {
  const [filters, setFilters] = useState({
    name: '',
    mrn: '',
    status: ''
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.getPatients(filters);
        if (isCurrent) {
          setPatients(response);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err instanceof Error ? err.message : 'Unable to load patients.');
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [filters]);

  const handleFilterChange =
    (field: keyof typeof filters) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
        <button
          className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition"
          onClick={() => setIsDialogOpen(true)}
        >
          Add Patient
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-medium text-gray-700">
            Name
            <input
              type="text"
              value={filters.name}
              onChange={handleFilterChange('name')}
              placeholder="Search by name"
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            MRN
            <input
              type="text"
              value={filters.mrn}
              onChange={handleFilterChange('mrn')}
              placeholder="Search by MRN"
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Status
            <select
              value={filters.status}
              onChange={handleFilterChange('status')}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading patients...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No patients match these filters yet.
          </div>
        ) : (
          <div className="space-y-4">
            {patients.map((patient) => (
              <div
                key={patient._id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {patient.full_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    MRN: {patient.mrn || '—'}
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                  {patient.status ?? 'Unknown'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddPatientDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
