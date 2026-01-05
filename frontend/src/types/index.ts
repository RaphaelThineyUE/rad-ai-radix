export interface User {
  _id: string;
  email: string;
  full_name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  _id: string;
  mrn: string;
  full_name: string;
  date_of_birth: string;
  contact_info?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RadiologyReport {
  _id: string;
  patient_id: string;
  filename: string;
  file_url?: string;
  file_size?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: string;
  birads?: {
    value?: number;
    confidence?: 'low' | 'medium' | 'high';
    evidence?: string[];
  };
  breast_density?: {
    value?: string;
    evidence?: string[];
  };
  exam?: {
    type?: string;
    laterality?: string;
    evidence?: string[];
  };
  comparison?: {
    prior_exam_date?: string;
    evidence?: string[];
  };
  findings?: Array<{
    laterality?: string;
    location?: string;
    description?: string;
    assessment?: string;
    evidence?: string[];
  }>;
  recommendations?: Array<{
    action?: string;
    timeframe?: string;
    evidence?: string[];
  }>;
  red_flags?: string[];
  processing_time_ms?: number;
  raw_text?: string;
  created_date: string;
  updated_date: string;
}

export interface TreatmentRecord {
  _id: string;
  patient_id: string;
  treatment_type: string;
  start_date: string;
  end_date?: string;
  status: string;
  notes?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}
