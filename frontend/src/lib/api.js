const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
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
  async register(email, full_name, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, full_name, password })
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateMe(data) {
    return this.request('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Patient endpoints
  async getPatients(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/patients?${params}`);
  }

  async createPatient(data) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getPatient(id) {
    return this.request(`/patients/${id}`);
  }

  async updatePatient(id, data) {
    return this.request(`/patients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deletePatient(id) {
    return this.request(`/patients/${id}`, {
      method: 'DELETE'
    });
  }

  // Report endpoints
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/reports/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  async createReport(data) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async processReport(report_id) {
    return this.request('/reports/process', {
      method: 'POST',
      body: JSON.stringify({ report_id })
    });
  }

  async getReports(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/reports?${params}`);
  }

  async getReport(id) {
    return this.request(`/reports/${id}`);
  }

  async updateReport(id, data) {
    return this.request(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteReport(id) {
    return this.request(`/reports/${id}`, {
      method: 'DELETE'
    });
  }

  // Treatment endpoints
  async getTreatments(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/treatments?${params}`);
  }

  async createTreatment(data) {
    return this.request('/treatments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTreatment(id) {
    return this.request(`/treatments/${id}`);
  }

  async updateTreatment(id, data) {
    return this.request(`/treatments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteTreatment(id) {
    return this.request(`/treatments/${id}`, {
      method: 'DELETE'
    });
  }

  // AI endpoints
  async analyzeReport(pdf_text) {
    return this.request('/ai/analyze-report', {
      method: 'POST',
      body: JSON.stringify({ pdf_text })
    });
  }

  async generateSummary(extracted_data) {
    return this.request('/ai/generate-summary', {
      method: 'POST',
      body: JSON.stringify({ extracted_data })
    });
  }

  async consolidateReports(patient_id) {
    return this.request('/ai/consolidate-reports', {
      method: 'POST',
      body: JSON.stringify({ patient_id })
    });
  }

  async compareTreatments(patient_id, treatment_options) {
    return this.request('/ai/compare-treatments', {
      method: 'POST',
      body: JSON.stringify({ patient_id, treatment_options })
    });
  }
}

export const apiClient = new ApiClient();
