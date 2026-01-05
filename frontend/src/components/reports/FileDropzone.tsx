import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api';

interface FileDropzoneProps {
  patientId?: string;
  onUploadSuccess?: () => void;
}

export default function FileDropzone({ patientId, onUploadSuccess }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!patientId) {
        toast.error('Please select a patient first');
        return;
      }

      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setIsUploading(true);

      try {
        const uploadData = await apiClient.uploadFile(file);
        const report = await apiClient.createReport({
          patient_id: patientId,
          filename: uploadData.filename || file.name,
          file_url: uploadData.file_url,
          file_size: uploadData.file_size
        });

        setIsUploading(false);
        setIsProcessing(true);

        await apiClient.processReport(report._id);

        toast.success('Report uploaded and processed successfully!');
        onUploadSuccess?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        setIsUploading(false);
        setIsProcessing(false);
      }
    },
    [onUploadSuccess, patientId]
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);

      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        void handleFile(event.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const onBrowseClick = () => {
    if (isUploading || isProcessing) return;
    fileInputRef.current?.click();
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
    event.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${
          isDragging ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-white'
        } ${isUploading || isProcessing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isUploading && !isProcessing) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={onBrowseClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            onBrowseClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFileChange}
          disabled={isUploading || isProcessing}
        />

        {isUploading || isProcessing ? (
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <Loader2 className="animate-spin" size={32} />
            <div className="font-medium">
              {isUploading ? 'Uploading report...' : 'Processing with AI...'}
            </div>
            <p className="text-sm text-gray-500">
              {isUploading
                ? 'Securely transferring your PDF.'
                : 'Analyzing report findings and recommendations.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <div className="flex items-center gap-2 text-pink-600">
              <Upload size={20} />
              <FileText size={20} />
            </div>
            <div className="text-lg font-semibold text-gray-900">Drop PDF report here</div>
            <p className="text-sm text-gray-500">Or click to browse files (max 10MB)</p>
          </div>
        )}
      </div>
      {!patientId && (
        <p className="text-sm text-amber-600">
          Select a patient to enable uploads.
        </p>
      )}
    </div>
  );
}
