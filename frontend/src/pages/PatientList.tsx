import { useState } from 'react';
import AddPatientDialog from '../components/patients/AddPatientDialog';

export default function PatientList() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
        <button
          className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition"
          onClick={() => setIsDialogOpen(true)}
        >
          Add Patient
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-lg md:grid-cols-3">
        <label className="space-y-2 text-sm font-medium text-gray-700">
          Search
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name, stage, or ID"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-gray-700">
          Cancer type
          <input
            type="text"
            value={cancerTypeInput}
            onChange={(event) => setCancerTypeInput(event.target.value)}
            placeholder="Filter by cancer type"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-gray-700">
          Stage
          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value as Patient['cancer_stage'] | '')}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            <option value="">All stages</option>
            {stageOptions
              .filter((stage) => stage)
              .map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading patients...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No patients yet. Add your first patient to get started.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {pagePatients.map((patient) => (
                <Link
                  to={`/patients/${patient._id}`}
                  key={patient._id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-pink-200 hover:bg-pink-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{patient.full_name}</h3>
                      <p className="text-sm text-gray-500">
                        {patient.cancer_type || 'Cancer type not set'}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                      {patient.cancer_stage || 'Unknown stage'}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Diagnosis:{' '}
                    {patient.diagnosis_date
                      ? new Date(patient.diagnosis_date).toLocaleDateString()
                      : 'Not provided'}
                  </div>
                </Link>
              ))}
            </div>

            {filteredPatients.length > PAGE_SIZE && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm">
                <span className="text-gray-500">
                  Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filteredPatients.length)} of{' '}
                  {filteredPatients.length} patients
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AddPatientDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </div>
  );
}
