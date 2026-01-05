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

type BiomarkerKey = 'glucose' | 'ldl' | 'hemoglobin' | 'vitaminD';

type PatientBiomarkers = Record<BiomarkerKey, number>;

type Patient = {
  id: string;
  treatmentStatus: 'active' | 'completed' | 'pending';
  biomarkers: PatientBiomarkers;
};

type BiomarkerRange = {
  label: string;
  unit: string;
  low: number;
  high: number;
};

const biomarkerRanges: Record<BiomarkerKey, BiomarkerRange> = {
  glucose: {
    label: 'Glucose (mg/dL)',
    unit: 'mg/dL',
    low: 70,
    high: 140,
  },
  ldl: {
    label: 'LDL Cholesterol (mg/dL)',
    unit: 'mg/dL',
    low: 0,
    high: 129,
  },
  hemoglobin: {
    label: 'Hemoglobin (g/dL)',
    unit: 'g/dL',
    low: 12,
    high: 17.5,
  },
  vitaminD: {
    label: 'Vitamin D (ng/mL)',
    unit: 'ng/mL',
    low: 20,
    high: 50,
  },
};

const patients: Patient[] = [
  {
    id: 'P-001',
    treatmentStatus: 'active',
    biomarkers: {
      glucose: 110,
      ldl: 132,
      hemoglobin: 13.5,
      vitaminD: 18,
    },
  },
  {
    id: 'P-002',
    treatmentStatus: 'completed',
    biomarkers: {
      glucose: 152,
      ldl: 98,
      hemoglobin: 12.2,
      vitaminD: 32,
    },
  },
  {
    id: 'P-003',
    treatmentStatus: 'active',
    biomarkers: {
      glucose: 88,
      ldl: 160,
      hemoglobin: 15.1,
      vitaminD: 44,
    },
  },
  {
    id: 'P-004',
    treatmentStatus: 'pending',
    biomarkers: {
      glucose: 130,
      ldl: 118,
      hemoglobin: 11.2,
      vitaminD: 24,
    },
  },
  {
    id: 'P-005',
    treatmentStatus: 'completed',
    biomarkers: {
      glucose: 175,
      ldl: 142,
      hemoglobin: 16.2,
      vitaminD: 58,
    },
  },
];

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
            <BarChart
              data={biomarkerDistribution}
              margin={{ top: 16, right: 16, bottom: 24, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="biomarker"
                interval={0}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const safeName =
                    typeof name === 'string' && name.length > 0
                      ? name.charAt(0).toUpperCase() + name.slice(1)
                      : name ?? '';
                  return [value, safeName];
                }}
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
