import type { 
  User, 
  Patient, 
  RadiologyReport, 
  TreatmentRecord, 
  AuthResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestOptions = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(email: string, full_name: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, full_name, password })
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateMe(data: Partial<User>): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Patient endpoints
  async getPatients(filters: Record<string, string> = {}): Promise<{ patients: Patient[] }> {
    const params = new URLSearchParams(filters);
    return this.request<{ patients: Patient[] }>(`/patients?${params}`);
  }

  async createPatient(data: Partial<Patient>): Promise<{ patient: Patient }> {
    return this.request<{ patient: Patient }>('/patients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getPatient(id: string): Promise<{ patient: Patient }> {
    return this.request<{ patient: Patient }>(`/patients/${id}`);
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<{ patient: Patient }> {
    return this.request<{ patient: Patient }>(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deletePatient(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/patients/${id}`, {
      method: 'DELETE'
    });
  }

  // Report endpoints
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ file_path: string; extracted_text?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.baseURL}/reports/upload`);
      xhr.responseType = 'json';

      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.addEventListener('progress', (event) => {
        if (!onProgress || !event.lengthComputable) {
          return;
        }
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
          return;
        }
        const errorMessage =
          (xhr.response as { error?: string } | null)?.error || 'Upload failed';
        reject(new Error(errorMessage));
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.send(formData);
    });
  }

  async createReport(data: Partial<RadiologyReport>): Promise<{ report: RadiologyReport }> {
    return this.request<{ report: RadiologyReport }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async processReport(report_id: string): Promise<{ analysis: Record<string, any> }> {
    return this.request<{ analysis: Record<string, any> }>('/reports/process', {
      method: 'POST',
      body: JSON.stringify({ report_id })
    });
  }

  async getReports(filters: Record<string, string> = {}): Promise<{ reports: RadiologyReport[] }> {
    const params = new URLSearchParams(filters);
    return this.request<{ reports: RadiologyReport[] }>(`/reports?${params}`);
  }

  async getReport(id: string): Promise<{ report: RadiologyReport }> {
    return this.request<{ report: RadiologyReport }>(`/reports/${id}`);
  }

  async updateReport(id: string, data: Partial<RadiologyReport>): Promise<{ report: RadiologyReport }> {
    return this.request<{ report: RadiologyReport }>(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteReport(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/reports/${id}`, {
      method: 'DELETE'
    });
  }

  // Treatment endpoints
  async getTreatments(filters: Record<string, string> = {}): Promise<{ treatments: TreatmentRecord[] }> {
    const params = new URLSearchParams(filters);
    return this.request<{ treatments: TreatmentRecord[] }>(`/treatments?${params}`);
  }

  async createTreatment(data: Partial<TreatmentRecord>): Promise<{ treatment: TreatmentRecord }> {
    return this.request<{ treatment: TreatmentRecord }>('/treatments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTreatment(id: string): Promise<{ treatment: TreatmentRecord }> {
    return this.request<{ treatment: TreatmentRecord }>(`/treatments/${id}`);
  }

  async updateTreatment(id: string, data: Partial<TreatmentRecord>): Promise<{ treatment: TreatmentRecord }> {
    return this.request<{ treatment: TreatmentRecord }>(`/treatments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteTreatment(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/treatments/${id}`, {
      method: 'DELETE'
    });
  }

  // AI endpoints
  async analyzeReport(pdf_text: string): Promise<{ analysis: Record<string, any> }> {
    return this.request<{ analysis: Record<string, any> }>('/ai/analyze-report', {
      method: 'POST',
      body: JSON.stringify({ pdf_text })
    });
  }

  async generateSummary(extracted_data: Record<string, any>): Promise<{ summary: string }> {
    return this.request<{ summary: string }>('/ai/generate-summary', {
      method: 'POST',
      body: JSON.stringify({ extracted_data })
    });
  }

  async consolidateReports(patient_id: string): Promise<{ consolidated_data: Record<string, any> }> {
    return this.request<{ consolidated_data: Record<string, any> }>('/ai/consolidate-reports', {
      method: 'POST',
      body: JSON.stringify({ patient_id })
    });
  }

  async compareTreatments(patient_id: string, treatment_options: string[]): Promise<{ comparison: Record<string, any> }> {
    return this.request<{ comparison: Record<string, any> }>('/ai/compare-treatments', {
      method: 'POST',
      body: JSON.stringify({ patient_id, treatment_options })
    });
  }
}

export const apiClient = new ApiClient();
