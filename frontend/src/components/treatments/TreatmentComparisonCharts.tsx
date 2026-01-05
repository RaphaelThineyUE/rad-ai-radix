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

export type TreatmentOutcomeDatum = {
  treatment: string;
  responseRate: number;
  medianSurvivalMonths: number;
};

export type TreatmentSideEffectDatum = {
  treatment: string;
  nauseaRate: number;
  fatigueRate: number;
  neuropathyRate: number;
};

export type TreatmentComparisonChartsProps = {
  outcomeData?: TreatmentOutcomeDatum[];
  sideEffectData?: TreatmentSideEffectDatum[];
};

const chartContainerClass =
  'flex h-72 items-center justify-center text-sm text-gray-500';

export default function TreatmentComparisonCharts({
  outcomeData,
  sideEffectData,
}: TreatmentComparisonChartsProps) {
  const hasOutcomes = Boolean(outcomeData && outcomeData.length > 0);
  const hasSideEffects = Boolean(sideEffectData && sideEffectData.length > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Treatment Outcomes
          </h3>
          <p className="text-sm text-gray-500">
            Response rates and median survival by regimen.
          </p>
        </div>
        {hasOutcomes ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outcomeData} margin={{ left: 8, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="treatment" tickMargin={8} />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="responseRate"
                  name="Response rate (%)"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="medianSurvivalMonths"
                  name="Median survival (months)"
                  fill="#16a34a"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={chartContainerClass}>
            No outcome data available yet.
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Side Effect Burden
          </h3>
          <p className="text-sm text-gray-500">
            Percentage of patients reporting key side effects.
          </p>
        </div>
        {hasSideEffects ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sideEffectData} margin={{ left: 8, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="treatment" tickMargin={8} />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="nauseaRate"
                  name="Nausea (%)"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="fatigueRate"
                  name="Fatigue (%)"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="neuropathyRate"
                  name="Neuropathy (%)"
                  fill="#0ea5e9"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={chartContainerClass}>
            No side-effect data available yet.
          </div>
        )}
      </div>
    </div>
  );
}
