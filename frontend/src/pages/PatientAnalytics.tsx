import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/api';
import type { Patient, RadiologyReport } from '../types';

const stageOrder = [
  'Stage 0',
  'Stage I',
  'Stage II',
  'Stage III',
  'Stage IV',
  'Unknown'
];

const stageColors: Record<string, string> = {
  'Stage 0': 'bg-emerald-500',
  'Stage I': 'bg-blue-500',
  'Stage II': 'bg-indigo-500',
  'Stage III': 'bg-purple-500',
  'Stage IV': 'bg-rose-500',
  Unknown: 'bg-gray-400'
};

export default function PatientAnalytics() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<RadiologyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [patientData, reportData] = await Promise.all([
          apiClient.getPatients(),
          apiClient.getReports()
        ]);
        if (mounted) {
          setPatients(patientData);
          setReports(reportData);
        }
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const stageCounts = useMemo(() => {
    const counts = stageOrder.reduce<Record<string, number>>((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {});

    patients.forEach((patient) => {
      const stage = patient.cancer_stage && stageOrder.includes(patient.cancer_stage)
        ? patient.cancer_stage
        : 'Unknown';
      counts[stage] += 1;
    });

    return counts;
  }, [patients]);

  const totalPatients = patients.length;
  const totalReports = reports.length;
  const maxStageCount = Math.max(1, ...Object.values(stageCounts));
  const hasStageData = totalPatients > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {loading ? '—' : totalPatients}
          </div>
          <div className="text-gray-600">Total Patients</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">0</div>
          <div className="text-gray-600">Active Treatments</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {loading ? '—' : totalReports}
          </div>
          <div className="text-gray-600">Completed Reports</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
          <div className="text-gray-600">Pending Reviews</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Staging Distribution
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {stageOrder.map((stage) => (
              <div key={stage} className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${stageColors[stage]}`}
                />
                <span>{stage}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {!hasStageData ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-gray-500">
              No staging data available yet. Add patients to see distribution.
            </div>
          ) : (
            <div className="space-y-4">
              {stageOrder.map((stage) => {
                const count = stageCounts[stage];
                const percent = Math.round((count / totalPatients) * 100);
                return (
                  <div key={stage} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium text-gray-700">
                      {stage}
                    </div>
                    <div className="flex-1">
                      <div className="h-3 rounded-full bg-gray-100">
                        <div
                          className={`h-3 rounded-full ${stageColors[stage]}`}
                          style={{ width: `${(count / maxStageCount) * 100}%` }}
                          aria-label={`${stage} patients`}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm text-gray-600">
                      {count} ({percent}%)
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
