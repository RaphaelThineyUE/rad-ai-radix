import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '../lib/api';

export default function PatientDetail() {
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) {
      toast.error('Patient not found.');
      return;
    }

    if (!selectedFile) {
      toast.error('Please choose a PDF report to upload.');
      return;
    }

    try {
      setIsUploading(true);
      const uploadedFile = await apiClient.uploadFile(selectedFile);
      await apiClient.createReport({
        patient_id: id,
        filename: uploadedFile.filename,
        file_url: uploadedFile.file_url,
        file_size: uploadedFile.file_size
      });
      toast.success('Report uploaded successfully.');
      setSelectedFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Patient Details
        </h2>
        {isLoading && (
          <p className="text-gray-500">Loading patient details...</p>
        )}
        {!isLoading && errorMessage && (
          <p className="text-red-600">{errorMessage}</p>
        )}
        {!isLoading && !errorMessage && patientDetail && (
          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-semibold text-gray-900">Name:</span>{' '}
              {patientDetail.patient.full_name || 'Unknown'}
            </p>
            {patientDetail.patient.mrn && (
              <p>
                <span className="font-semibold text-gray-900">MRN:</span>{' '}
                {patientDetail.patient.mrn}
              </p>
            )}
            <p>
              <span className="font-semibold text-gray-900">Patient ID:</span>{' '}
              {patientDetail.patient._id}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Date of Birth:</span>{' '}
              {formatDateValue(patientDetail.patient.date_of_birth)}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Upload Radiology Report
        </h3>
        <form className="space-y-4" onSubmit={handleUpload}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="report-upload">
              PDF Report
            </label>
            <input
              id="report-upload"
              type="file"
              accept="application/pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-700 hover:file:bg-pink-100"
            />
          </div>
          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex items-center justify-center rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-400"
          >
            {isUploading ? 'Uploading...' : 'Upload Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
