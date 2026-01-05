import { useState } from 'react';
import FileDropzone from '../components/reports/FileDropzone';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );

  const handleFileSelected = (file: File, patientId: string) => {
    setSelectedFile(file);
    setSelectedPatientId(patientId);
  };

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
          Upload a New Report
        </h3>
        <FileDropzone onFileSelected={handleFileSelected} />
        {selectedFile && selectedPatientId && (
          <div className="mt-4 rounded-lg bg-pink-50 px-4 py-3 text-sm text-pink-700">
            Ready to upload{' '}
            <span className="font-medium">{selectedFile.name}</span> for patient
            ID <span className="font-medium">{selectedPatientId}</span>.
          </div>
        )}
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
