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
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTreatments = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getTreatments();
        if (isMounted) {
          setTreatments(response.treatments || []);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error('Failed to load treatments', error);
        if (isMounted) {
          setErrorMessage('Unable to load treatment outcomes right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTreatments();

    return () => {
      isMounted = false;
    };
  }, []);

  const statusStats = useMemo(() => {
    const counts = treatments.reduce<Record<string, number>>((acc, treatment) => {
      const statusLabel = treatment.status?.trim() ? treatment.status.trim() : 'Unknown';
      acc[statusLabel] = (acc[statusLabel] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({
      name: formatStatusLabel(name),
      value
    }));
  }, [treatments]);

  const treatmentTypeStats = useMemo(() => {
    const counts = treatments.reduce<
      Record<string, { name: string; total: number; completed: number }>
    >((acc, treatment) => {
      const typeLabel = treatment.treatment_type?.trim() || 'Unspecified';
      if (!acc[typeLabel]) {
        acc[typeLabel] = { name: typeLabel, total: 0, completed: 0 };
      }
      acc[typeLabel].total += 1;
      if (treatment.status && isCompletedStatus(treatment.status)) {
        acc[typeLabel].completed += 1;
      }
      return acc;
    }, {});

    return Object.values(counts);
  }, [treatments]);

  const statTotals = useMemo(() => {
    const activeCount = treatments.filter((treatment) => {
      const normalized = treatment.status?.toLowerCase() ?? '';
      return normalized.includes('active') || normalized.includes('progress');
    }).length;

    const completedCount = treatments.filter((treatment) =>
      treatment.status ? isCompletedStatus(treatment.status) : false
    ).length;

    const pendingCount = treatments.filter((treatment) => {
      const normalized = treatment.status?.toLowerCase() ?? '';
      return normalized.includes('pending') || normalized.includes('scheduled');
    }).length;

    return {
      total: treatments.length,
      active: activeCount,
      completed: completedCount,
      pending: pendingCount
    };
  }, [treatments]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500">
            Track treatment outcomes and completion trends.
          </p>
        </div>
        {isLoading && <span className="text-sm text-gray-400">Loading...</span>}
      </div>

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
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white rounded-xl shadow-md p-6 space-y-3">
            <div className="text-sm font-semibold text-gray-500">{metric.title}</div>
            <div className={`text-3xl font-bold ${metric.accent}`}>{metric.value}</div>
            <div className="text-xs text-gray-500">{metric.helper}</div>
            <TrendIndicator trend={metric.trend} />
          </div>
        ))}
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
