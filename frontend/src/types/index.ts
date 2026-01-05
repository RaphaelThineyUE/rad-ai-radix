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
  full_name: string;
  date_of_birth: string;
  cancer_stage?: string;
  contact_info?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  created_date?: string;
  updated_date?: string;
}

export interface RadiologyReport {
  _id: string;
  patient_id: string;
  filename?: string;
  file_url?: string;
  file_size?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: string;
  report_date: string;
  report_type: string;
  findings: string | Array<{
    laterality?: string;
    location?: string;
    description?: string;
    assessment?: string;
    evidence?: string[];
  }>;
  impressions: string;
  recommendations?: string | Array<{
    action?: string;
    timeframe?: string;
    evidence?: string[];
  }>;
  file_path?: string;
  file_url?: string;
  filename?: string;
  file_size?: number;
  extracted_text?: string;
  raw_text?: string;
  summary?: string;
  birads?: string;
  breast_density?: string;
  exam?: string;
  comparison?: string;
  ai_analysis?: Record<string, any>;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  processing_time_ms?: number;
  createdAt?: string;
  updatedAt?: string;
  created_date?: string;
  updated_date?: string;
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
  createdAt?: string;
  updatedAt?: string;
  created_date?: string;
  updated_date?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}
