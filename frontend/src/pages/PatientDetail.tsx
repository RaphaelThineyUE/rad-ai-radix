import { useParams } from 'react-router-dom';
import ReportCard from '../components/reports/ReportCard';

const patientReports = [
  {
    id: 'pd-001',
    patientName: 'Taylor Jordan',
    reportDate: 'Jul 30, 2024',
    birads: 1 as const,
    status: 'Reviewed',
  },
  {
    id: 'pd-002',
    patientName: 'Taylor Jordan',
    reportDate: 'Jul 10, 2024',
    birads: 3 as const,
    status: 'Follow-up Scheduled',
  },
];

export default function PatientDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Patient Details
        </h2>
        <p className="text-gray-600">Patient ID: {id}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Reports
        </h3>
        <div className="space-y-4">
          {patientReports.map((report) => (
            <ReportCard
              key={report.id}
              patientName={report.patientName}
              reportDate={report.reportDate}
              birads={report.birads}
              status={report.status}
              onSelect={() => {
                console.log(`Selected report ${report.id}`);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
