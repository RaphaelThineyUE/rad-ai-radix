import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/api';
import FileDropzone from '../components/reports/FileDropzone';
import type { RadiologyReport } from '../types';

interface StatusCounts {
  total: number;
  completed: number;
  needsReview: number;
}

const statusStyles: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-gray-100 text-gray-800'
};

export default function Home() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiClient.getPatients()
  });

  const {
    data: reports,
    isLoading: reportsLoading,
    refetch: refetchReports
  } = useQuery({
    queryKey: ['reports', selectedPatientId],
    queryFn: () => apiClient.getReports({ patient_id: selectedPatientId }),
    enabled: Boolean(selectedPatientId)
  });

  const statusCounts: StatusCounts = useMemo(() => {
    if (!reports) {
      return { total: 0, completed: 0, needsReview: 0 };
    }

    const completed = reports.filter((report) => report.status === 'completed').length;
    const needsReview = reports.filter((report) =>
      report.status === 'failed' || report.status === 'pending'
    ).length;

    return {
      total: reports.length,
      completed,
      needsReview
    };
  }, [reports]);

  const renderReportList = () => {
    if (!selectedPatientId) {
      return (
        <div className="text-center py-12 text-gray-500">
          Select a patient to view reports.
        </div>
      );
    }

    if (reportsLoading) {
      return (
        <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
          <Loader2 className="animate-spin" size={20} />
          Loading reports...
        </div>
      );
    }

    if (!reports || reports.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No reports yet. Upload your first report to get started.
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {reports.map((report: RadiologyReport) => (
          <div key={report._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-pink-50 text-pink-600 rounded-lg p-2">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{report.filename}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(report.created_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  statusStyles[report.status ?? 'pending']
                }`}
              >
                {report.status ?? 'pending'}
              </span>
            </div>
            {report.birads?.value && (
              <div className="mt-3 text-sm text-gray-600">
                BI-RADS {report.birads.value} ({report.birads.confidence ?? 'unknown'} confidence)
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to RadReport AI
        </h2>
        <p className="text-gray-600">
          Upload and analyze breast radiology reports with AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-pink-600 mb-2">{statusCounts.total}</div>
          <div className="text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">{statusCounts.completed}</div>
          <div className="text-gray-600">Analyzed</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{statusCounts.needsReview}</div>
          <div className="text-gray-600">Needs Review</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">Upload Report</h3>
          <p className="text-sm text-gray-500">Choose a patient and upload a PDF report.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Patient</label>
          <div className="relative">
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={selectedPatientId}
              onChange={(event) => setSelectedPatientId(event.target.value)}
              disabled={patientsLoading}
            >
              <option value="">Select a patient</option>
              {patients?.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.full_name}
                </option>
              ))}
            </select>
            {patientsLoading && (
              <div className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                <Loader2 className="animate-spin" size={16} />
              </div>
            )}
          </div>
        </div>

        <FileDropzone patientId={selectedPatientId} onUploadSuccess={refetchReports} />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h3>
        {renderReportList()}
      </div>
    </div>
  );
}
