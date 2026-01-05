import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import apiClient from '../../lib/api';
import type { Patient } from '../../types';

interface FileDropzoneProps {
  onUploadSuccess?: () => void;
}

export default function FileDropzone({ onUploadSuccess }: FileDropzoneProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadPatients = async () => {
      try {
        const { patients: data } = await apiClient.getPatients();
        if (isActive) {
          setPatients(data);
        }
      } catch (error) {
        console.error('Failed to load patients', error);
        toast.error('Unable to load patients.');
      }
    };

    loadPatients();
    return () => {
      isActive = false;
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!patientId) {
      toast.error('Please select a patient before uploading.');
      return;
    }

    if (!selectedFile) {
      toast.error('Please choose a PDF file to upload.');
      return;
    }

    setLoading(true);
    try {
      const uploadData = await apiClient.uploadFile(selectedFile, patientId);
      const report = await apiClient.createReport({
        patient_id: patientId,
        filename: uploadData.filename,
        file_url: uploadData.file_url,
        file_size: uploadData.file_size
      });

      await apiClient.processReport(report._id, patientId);
      toast.success('Report uploaded and processed successfully!');
      setSelectedFile(null);
      onUploadSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Upload Report</h3>
        <p className="text-sm text-gray-500">
          Select a patient and upload a PDF report for processing.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Patient</label>
        <select
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
        >
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient._id} value={patient._id}>
              {patient.full_name} ({patient.mrn})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">PDF File</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-600 file:mr-4 file:rounded-xl file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-700 hover:file:bg-pink-100"
        />
        {selectedFile ? (
          <p className="text-xs text-gray-500">Selected: {selectedFile.name}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleUpload}
        disabled={loading}
        className="w-full rounded-xl bg-pink-600 px-4 py-2 text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Uploading...' : 'Upload & Process'}
      </button>
    </div>
  );
}
