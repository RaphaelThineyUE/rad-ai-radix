export type BiomarkerKey = 'glucose' | 'ldl' | 'hemoglobin' | 'vitaminD';

export type PatientBiomarkers = Record<BiomarkerKey, number>;

export type Patient = {
  id: string;
  treatmentStatus: 'active' | 'completed' | 'pending';
  biomarkers: PatientBiomarkers;
};

export type BiomarkerRange = {
  label: string;
  unit: string;
  low: number;
  high: number;
};

export const biomarkerRanges: Record<BiomarkerKey, BiomarkerRange> = {
  glucose: {
    label: 'Glucose (mg/dL)',
    unit: 'mg/dL',
    low: 70,
    high: 140,
  },
  ldl: {
    label: 'LDL Cholesterol (mg/dL)',
    unit: 'mg/dL',
    low: 0,
    high: 129,
  },
  hemoglobin: {
    label: 'Hemoglobin (g/dL)',
    unit: 'g/dL',
    low: 12,
    high: 17.5,
  },
  vitaminD: {
    label: 'Vitamin D (ng/mL)',
    unit: 'ng/mL',
    low: 20,
    high: 50,
  },
};

export const mockPatients: Patient[] = [
  {
    id: 'P-001',
    treatmentStatus: 'active',
    biomarkers: {
      glucose: 110,
      ldl: 132,
      hemoglobin: 13.5,
      vitaminD: 18,
    },
  },
  {
    id: 'P-002',
    treatmentStatus: 'completed',
    biomarkers: {
      glucose: 152,
      ldl: 98,
      hemoglobin: 12.2,
      vitaminD: 32,
    },
  },
  {
    id: 'P-003',
    treatmentStatus: 'active',
    biomarkers: {
      glucose: 88,
      ldl: 160,
      hemoglobin: 15.1,
      vitaminD: 44,
    },
  },
  {
    id: 'P-004',
    treatmentStatus: 'pending',
    biomarkers: {
      glucose: 130,
      ldl: 118,
      hemoglobin: 11.2,
      vitaminD: 24,
    },
  },
  {
    id: 'P-005',
    treatmentStatus: 'completed',
    biomarkers: {
      glucose: 175,
      ldl: 142,
      hemoglobin: 16.2,
      vitaminD: 58,
    },
  },
];
