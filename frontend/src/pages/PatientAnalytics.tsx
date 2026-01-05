import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  biomarkerRanges,
  mockPatients as patients,
  type BiomarkerKey,
  type BiomarkerRange,
} from '../mockData/patientAnalytics';

const biomarkerKeys = Object.keys(biomarkerRanges) as BiomarkerKey[];

const categorizeValue = (value: number, range: BiomarkerRange) => {
  if (value < range.low) {
    return 'low';
  }
  if (value > range.high) {
    return 'high';
  }
  return 'normal';
};

const biomarkerDistribution = biomarkerKeys.map((key) => {
  const range = biomarkerRanges[key];
  const summary = {
    biomarker: range.label,
    low: 0,
    normal: 0,
    high: 0,
  };

  patients.forEach((patient) => {
    const value = patient.biomarkers[key];
    const category = categorizeValue(value, range);
    summary[category] += 1;
  });

  return summary;
});

const totalPatients = patients.length;
const activeTreatments = patients.filter(
  (patient) => patient.treatmentStatus === 'active',
).length;
const completedReports = patients.filter(
  (patient) => patient.treatmentStatus === 'completed',
).length;
const pendingReviews = patients.filter(
  (patient) => patient.treatmentStatus === 'pending',
).length;

export default function PatientAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {totalPatients}
          </div>
          <div className="text-gray-600">Total Patients</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {activeTreatments}
          </div>
          <div className="text-gray-600">Active Treatments</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {completedReports}
          </div>
          <div className="text-gray-600">Completed Reports</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {pendingReviews}
          </div>
          <div className="text-gray-600">Pending Reviews</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Biomarker Distribution
          </h3>
          <p className="text-sm text-gray-500">
            Distribution based on latest patient biomarker readings.
          </p>
        </div>

        <div className="mt-6 h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={biomarkerDistribution} margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="biomarker"
                interval={0}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  value,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
              />
              <Legend />
              <Bar dataKey="low" name="Low" stackId="a" fill="#f97316" />
              <Bar dataKey="normal" name="Normal" stackId="a" fill="#22c55e" />
              <Bar dataKey="high" name="High" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {biomarkerKeys.map((key) => (
            <div
              key={key}
              className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600"
            >
              <div className="font-semibold text-gray-900">
                {biomarkerRanges[key].label}
              </div>
              <div>
                Normal range: {biomarkerRanges[key].low}–
                {biomarkerRanges[key].high} {biomarkerRanges[key].unit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
