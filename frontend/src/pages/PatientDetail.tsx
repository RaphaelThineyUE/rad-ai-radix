import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PatientTimeline, {
  PatientTimelineEvent
} from '../components/patients/PatientTimeline';
import { apiClient } from '../lib/api';
import type { Patient, RadiologyReport, TreatmentRecord } from '../types';

interface PatientDetailResponse {
  patient: Patient;
  reports: RadiologyReport[];
  treatments: TreatmentRecord[];
}

const formatDateValue = (value?: string) => {
  if (!value) {
    return 'Unknown';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(parsed);
};

const toTimestamp = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const extractPatient = (response: unknown): Patient | null => {
  if (response && typeof response === 'object' && 'patient' in response) {
    return (response as { patient: Patient }).patient;
  }
  return response as Patient;
};

const extractReports = (response: unknown): RadiologyReport[] => {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === 'object' && 'reports' in response) {
    return (response as { reports: RadiologyReport[] }).reports || [];
  }
  return [];
};

const extractTreatments = (response: unknown): TreatmentRecord[] => {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === 'object' && 'treatments' in response) {
    return (response as { treatments: TreatmentRecord[] }).treatments || [];
  }
  return [];
};

export default function PatientDetail() {
  const { id } = useParams();
  const [patientDetail, setPatientDetail] = useState<PatientDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setErrorMessage('Patient ID is missing.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadPatientDetail = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [patientResponse, reportResponse, treatmentResponse] = await Promise.all([
          apiClient.getPatient(id),
          apiClient.getReports({ patient_id: id }),
          apiClient.getTreatments({ patient_id: id })
        ]);

        if (!isMounted) {
          return;
        }

        const patient = extractPatient(patientResponse);
        if (!patient) {
          setErrorMessage('Patient details were not found.');
          setPatientDetail(null);
          return;
        }

        const reports = extractReports(reportResponse);
        const treatments = extractTreatments(treatmentResponse);

        setPatientDetail({
          patient,
          reports,
          treatments
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load patient.');
        setPatientDetail(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPatientDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const timelineEvents = useMemo<PatientTimelineEvent[]>(() => {
    if (!patientDetail) {
      return [];
    }

    const reportEvents: PatientTimelineEvent[] = patientDetail.reports.map(report => {
      const summary =
        report.impressions ||
        report.findings ||
        report.recommendations ||
        report.report_type ||
        'Report added.';

      return {
        id: report._id || `${report.patient_id}-${report.report_date}`,
        type: 'report',
        date: report.report_date || report.updatedAt || report.createdAt || '',
        title: report.report_type ? `${report.report_type} Report` : 'Radiology Report',
        summary
      };
    });

    const treatmentEvents: PatientTimelineEvent[] = patientDetail.treatments.map(treatment => {
      const summaryParts = [
        treatment.status ? `Status: ${treatment.status}` : null,
        treatment.notes || null
      ].filter(Boolean);

      return {
        id: treatment._id || `${treatment.patient_id}-${treatment.start_date}`,
        type: 'treatment',
        date: treatment.start_date || treatment.end_date || treatment.updatedAt || treatment.createdAt || '',
        title: treatment.treatment_type ? `${treatment.treatment_type} Treatment` : 'Treatment',
        summary: summaryParts.join(' • ') || 'Treatment recorded.'
      };
    });

    return [...reportEvents, ...treatmentEvents].sort(
      (first, second) => toTimestamp(first.date) - toTimestamp(second.date)
    );
  }, [patientDetail]);

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

      {!isLoading && !errorMessage && (
        <PatientTimeline events={timelineEvents} />
      )}
    </div>
  );
}
