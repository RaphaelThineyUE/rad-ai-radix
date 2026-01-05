import TreatmentComparisonCharts, {
  TreatmentOutcomeDatum,
  TreatmentSideEffectDatum,
} from '../components/treatments/TreatmentComparisonCharts';

const outcomeComparisonData: TreatmentOutcomeDatum[] = [
  {
    treatment: 'Regimen A',
    responseRate: 58,
    medianSurvivalMonths: 14,
  },
  {
    treatment: 'Regimen B',
    responseRate: 72,
    medianSurvivalMonths: 18,
  },
  {
    treatment: 'Regimen C',
    responseRate: 49,
    medianSurvivalMonths: 11,
  },
];

const sideEffectComparisonData: TreatmentSideEffectDatum[] = [
  {
    treatment: 'Regimen A',
    nauseaRate: 34,
    fatigueRate: 46,
    neuropathyRate: 18,
  },
  {
    treatment: 'Regimen B',
    nauseaRate: 41,
    fatigueRate: 39,
    neuropathyRate: 22,
  },
  {
    treatment: 'Regimen C',
    nauseaRate: 28,
    fatigueRate: 52,
    neuropathyRate: 14,
  },
];

export default function PatientAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-2 text-3xl font-bold text-blue-600">0</div>
          <div className="text-gray-600">Total Patients</div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-2 text-3xl font-bold text-green-600">0</div>
          <div className="text-gray-600">Active Treatments</div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-2 text-3xl font-bold text-purple-600">0</div>
          <div className="text-gray-600">Completed Reports</div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-2 text-3xl font-bold text-orange-600">0</div>
          <div className="text-gray-600">Pending Reviews</div>
        </div>
      </div>

      <TreatmentComparisonCharts
        outcomeData={outcomeComparisonData}
        sideEffectData={sideEffectComparisonData}
      />

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">
          Demographics Overview
        </h3>
        <div className="py-12 text-center text-gray-500">
          No data available yet. Add patients to see analytics.
        </div>
      </div>
    </div>
  );
}
