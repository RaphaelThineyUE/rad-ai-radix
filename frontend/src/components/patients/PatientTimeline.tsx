export type PatientTimelineEventType = 'report' | 'treatment';

export interface PatientTimelineEvent {
  id: string;
  type: PatientTimelineEventType;
  date: string;
  title: string;
  summary: string;
}

interface PatientTimelineProps {
  events: PatientTimelineEvent[];
}

const typeStyles: Record<PatientTimelineEventType, { badge: string; dot: string; label: string }> = {
  report: {
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
    label: 'Report'
  },
  treatment: {
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Treatment'
  }
};

const formatDate = (dateValue: string) => {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(parsed);
};

export default function PatientTimeline({ events }: PatientTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h3>
        <div className="text-center py-10 text-gray-500">
          No timeline events yet. Reports and treatments will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Timeline</h3>
      <ol className="space-y-6">
        {events.map(event => {
          const styles = typeStyles[event.type];
          return (
            <li key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`h-3 w-3 rounded-full ${styles.dot}`} />
                <span className="mt-2 flex-1 w-px bg-gray-200" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-semibold text-gray-900">{event.title}</h4>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles.badge}`}>
                    {styles.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{event.summary}</p>
                <p className="mt-2 text-xs font-medium text-gray-400">{formatDate(event.date)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
