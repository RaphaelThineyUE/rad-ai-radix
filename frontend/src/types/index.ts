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
  gender?: 'Male' | 'Female' | 'Other';
  ethnicity?: string;
  diagnosis_date?: string;
  cancer_type?: string;
  cancer_stage?: 'Stage 0' | 'Stage I' | 'Stage II' | 'Stage III' | 'Stage IV' | 'Unknown';
  tumor_size_cm?: number;
  lymph_node_positive?: boolean;
  er_status?: 'Positive' | 'Negative' | 'Unknown';
  pr_status?: 'Positive' | 'Negative' | 'Unknown';
  her2_status?: 'Positive' | 'Negative' | 'Unknown';
  menopausal_status?: string;
  initial_treatment_plan?: string;
  created_by?: string;
  created_date?: string;
  updated_date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RadiologyReport {
  _id: string;
  patient_id: string;
  report_date?: string;
  report_type?: string;
  findings?: string;
  impressions?: string;
  recommendations?: string;
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
  status?: string;
  created_by?: string;
  createdAt?: string;
  updatedAt?: string;
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
