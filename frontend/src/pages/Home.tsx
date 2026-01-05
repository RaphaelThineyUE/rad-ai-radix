import FileDropzone from '../components/reports/FileDropzone';

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

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Upload a Report
        </h3>
        <div className="max-w-2xl">
          <FileDropzone />
        </div>
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
        <div className="text-center py-12 text-gray-500">
          No reports yet. Upload your first report to get started.
        </div>
      </div>
    </div>
  );
}
