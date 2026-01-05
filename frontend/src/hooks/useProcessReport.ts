import { useState } from 'react';
import { apiClient } from '../lib/api';

type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

export function useProcessReport() {
  const [reportId, setReportId] = useState('');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastProcessedId, setLastProcessedId] = useState('');

  const isProcessing = processingStatus === 'processing';

  const handleProcessReport = async () => {
    if (!reportId.trim()) {
      return;
    }

    setProcessingStatus('processing');
    setErrorMessage('');
    setLastProcessedId('');

    try {
      await apiClient.processReport(reportId.trim());
      setLastProcessedId(reportId.trim());
      setProcessingStatus('completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Processing failed';
      setErrorMessage(message);
      setProcessingStatus('error');
    }
  };

  return {
    reportId,
    setReportId,
    processingStatus,
    errorMessage,
    lastProcessedId,
    isProcessing,
    handleProcessReport,
  };
}
