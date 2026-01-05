import { useEffect, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { apiClient } from '../../lib/api';
import type { Patient } from '../../types';

interface FileDropzoneProps {
  onFileSelected: (file: File, patientId: string) => void;
}

const ACCEPTED_MIME_TYPE = 'application/pdf';

export default function FileDropzone({ onFileSelected }: FileDropzoneProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPatients = async () => {
      try {
        setIsLoading(true);
        const { patients: patientResults } = await apiClient.getPatients();
        if (isMounted) {
          setPatients(patientResults);
          setFetchError(null);
        }
      } catch {
        if (isMounted) {
          setFetchError('Unable to load patients. Please try again.');
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

  const emitSelection = (file: File, patientId: string) => {
    if (!patientId) {
      setPatientError('Select a patient before uploading a report.');
      return;
    }

    setPatientError(null);
    onFileSelected(file, patientId);
  };

  const isPdfFile = (file: File) =>
    file.type === ACCEPTED_MIME_TYPE || file.name.toLowerCase().endsWith('.pdf');

  const handleFile = (file: File) => {
    if (!isPdfFile(file)) {
      setSelectedFile(null);
      setFileError('Only PDF files are supported.');
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    emitSelection(file, selectedPatientId);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const [file] = Array.from(event.dataTransfer.files);
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    if (file) {
      handleFile(file);
    }
  };

  const handlePatientChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const patientId = event.target.value;
    setSelectedPatientId(patientId);

    if (!patientId) {
      setPatientError('Select a patient before uploading a report.');
      return;
    }

    setPatientError(null);
    if (selectedFile) {
      emitSelection(selectedFile, patientId);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Patient
        </label>
        <select
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
          onChange={handlePatientChange}
          value={selectedPatientId}
          disabled={isLoading || !!fetchError}
        >
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient._id} value={patient._id}>
              {patient.full_name} ({patient.mrn})
            </option>
          ))}
        </select>
        {isLoading && (
          <p className="mt-2 text-sm text-gray-500">Loading patients...</p>
        )}
        {fetchError && (
          <p className="mt-2 text-sm text-red-600">{fetchError}</p>
        )}
        {patientError && (
          <p className="mt-2 text-sm text-red-600">{patientError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Report PDF
        </label>
        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
            isDragging
              ? 'border-pink-400 bg-pink-50'
              : 'border-gray-200 bg-white hover:border-pink-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            className="hidden"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <p className="text-sm font-medium text-gray-700">
            Drag and drop a PDF here, or click to browse
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Only PDF files are supported.
          </p>
        </label>
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: <span className="font-medium">{selectedFile.name}</span>
          </p>
        )}
        {fileError && (
          <p className="mt-2 text-sm text-red-600">{fileError}</p>
        )}
      </div>
    </div>
  );
}
