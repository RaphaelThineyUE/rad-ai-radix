import ReportCard from '../components/reports/ReportCard';

const recentReports = [
  {
    id: 'rr-001',
    patientName: 'Jamie Rivera',
    reportDate: 'Aug 12, 2024',
    birads: 2 as const,
    status: 'Reviewed',
  },
  {
    id: 'rr-002',
    patientName: 'Morgan Lee',
    reportDate: 'Aug 08, 2024',
    birads: 4 as const,
    status: 'Needs Review',
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to RadReport AI
        </h2>
        <p className="text-gray-600">
          Upload and analyze breast radiology reports with AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-pink-600 mb-2">0</div>
          <div className="text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">0</div>
          <div className="text-gray-600">Analyzed</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
          <div className="text-gray-600">Needs Review</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Reports
        </h3>
        <div className="space-y-4">
          {recentReports.map((report) => (
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
