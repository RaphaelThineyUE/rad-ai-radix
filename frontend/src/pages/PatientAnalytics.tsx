import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList
} from 'recharts';
import { apiClient } from '../lib/api';
import type { Patient } from '../types';

const CHART_COLORS = ['#3B82F6', '#10B981', '#A855F7', '#F97316', '#14B8A6', '#F59E0B'];

const AGE_BUCKETS = [
  { label: '<30', min: 0, max: 29 },
  { label: '30-39', min: 30, max: 39 },
  { label: '40-49', min: 40, max: 49 },
  { label: '50-59', min: 50, max: 59 },
  { label: '60-69', min: 60, max: 69 },
  { label: '70+', min: 70, max: Number.POSITIVE_INFINITY }
];

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

const getAge = (dateOfBirth?: string): number | null => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const getMostCommonValue = (values: Array<string | undefined>) => {
  const counts = new Map<string, number>();
  values.forEach(value => {
    const key = value?.trim() || 'Unknown';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  let top = 'Unknown';
  let max = 0;
  counts.forEach((count, key) => {
    if (count > max) {
      max = count;
      top = key;
    }
  });
  return { label: top, count: max };
};

export default function PatientAnalytics() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPatients = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getPatients();
        if (isMounted) {
          setPatients(response);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load patient analytics.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPatients();
    return () => {
      isMounted = false;
    };
  }, []);

  const ageData = useMemo(() => {
    const counts = AGE_BUCKETS.map(bucket => ({ label: bucket.label, value: 0 }));
    patients.forEach(patient => {
      const age = getAge(patient.date_of_birth);
      if (age === null) return;
      const bucketIndex = AGE_BUCKETS.findIndex(bucket => age >= bucket.min && age <= bucket.max);
      if (bucketIndex !== -1) {
        counts[bucketIndex].value += 1;
      }
    });
    return counts;
  }, [patients]);

  const genderData = useMemo(() => {
    const counts = new Map<string, number>();
    patients.forEach(patient => {
      const gender = patient.gender ?? 'Unknown';
      counts.set(gender, (counts.get(gender) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
  }, [patients]);

  const ethnicityData = useMemo(() => {
    const counts = new Map<string, number>();
    patients.forEach(patient => {
      const ethnicity = patient.ethnicity?.trim() || 'Unknown';
      counts.set(ethnicity, (counts.get(ethnicity) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [patients]);

  const stageData = useMemo(() => {
    const counts = new Map<string, number>();
    patients.forEach(patient => {
      const stage = patient.cancer_stage?.trim() || 'Unknown';
      counts.set(stage, (counts.get(stage) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [patients]);

  const averageAge = useMemo(() => {
    const ages = patients.map(patient => getAge(patient.date_of_birth)).filter((age): age is number => age !== null);
    if (ages.length === 0) return null;
    const total = ages.reduce((sum, age) => sum + age, 0);
    return Math.round(total / ages.length);
  }, [patients]);

  const topCancerType = useMemo(
    () => getMostCommonValue(patients.map(patient => patient.cancer_type)),
    [patients]
  );

  const hasData = patients.length > 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatNumber(patients.length)}
          </div>
          <div className="text-gray-600">Total Patients</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {averageAge === null ? '—' : `${averageAge}`}
          </div>
          <div className="text-gray-600">Average Age</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {topCancerType.count === 0 ? '—' : topCancerType.label}
          </div>
          <div className="text-gray-600">Most Common Cancer Type</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {formatNumber(topCancerType.count)}
          </div>
          <div className="text-gray-600">Patients in Top Cancer Type</div>
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
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading analytics…</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : !hasData ? (
          <div className="text-center py-12 text-gray-500">
            No data available yet. Add patients to see analytics.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Age Distribution</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value: number) => [formatNumber(value), 'Patients']} />
                  <Legend />
                  <Bar dataKey="value" name="Patients" fill="#3B82F6">
                    <LabelList dataKey="value" position="top" formatter={(value: number) => formatNumber(value)} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Sex Distribution</div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="label"
                    label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatNumber(value), 'Patients']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Ethnicity Breakdown</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ethnicityData} layout="vertical" margin={{ left: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="label" width={120} />
                  <Tooltip formatter={(value: number) => [formatNumber(value), 'Patients']} />
                  <Legend />
                  <Bar dataKey="value" name="Patients" fill="#10B981">
                    <LabelList dataKey="value" position="right" formatter={(value: number) => formatNumber(value)} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">Cancer Stage</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value: number) => [formatNumber(value), 'Patients']} />
                  <Legend />
                  <Bar dataKey="value" name="Patients" fill="#A855F7">
                    <LabelList dataKey="value" position="top" formatter={(value: number) => formatNumber(value)} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
