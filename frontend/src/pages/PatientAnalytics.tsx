import {
  getBiomarkerStatusClasses,
  getBiomarkerStatusLabel,
  type BiomarkerStatus,
} from '../lib/biomarkerStatus';

const biomarkerStatusTotals: Array<{
  status: BiomarkerStatus;
  count: number;
  description: string;
}> = [
  {
    status: 'positive',
    count: 18,
    description: 'Markers guiding targeted therapy selection.',
  },
  {
    status: 'negative',
    count: 11,
    description: 'Markers with no detected expression.',
  },
  {
    status: 'unknown',
    count: 6,
    description: 'Results awaiting confirmation or rerun.',
  },
];

export default function PatientAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
          <div className="text-gray-600">Total Patients</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">0</div>
          <div className="text-gray-600">Active Treatments</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
          <div className="text-gray-600">Completed Reports</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">0</div>
          <div className="text-gray-600">Pending Reviews</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Biomarker Status Overview
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {biomarkerStatusTotals.map((item) => (
            <div
              key={item.status}
              className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-5"
            >
              <div className="flex items-center justify-between">
                <span className={getBiomarkerStatusClasses(item.status)}>
                  {getBiomarkerStatusLabel(item.status)}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {item.count}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
