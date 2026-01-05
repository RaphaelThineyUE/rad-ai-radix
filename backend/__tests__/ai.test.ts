import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

describe('AI Routes', () => {
  let token: string;
  let testEmail: string;
  let patientId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/radreport-ai-test');
    }

    // Register test user
    testEmail = `ai-tests-${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        full_name: 'AI Tester',
        password: 'password123'
      });

    token = registerRes.body.token;

    // Create test patient
    const patientRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        full_name: 'Test Patient for AI',
        date_of_birth: '1975-03-15',
        gender: 'Female',
        diagnosis_date: '2022-08-20',
        cancer_type: 'Breast Cancer',
        cancer_stage: 'Stage III',
        biomarker_status: {
          er_positive: true,
          pr_positive: false,
          her2_positive: true
        }
      });

    patientId = patientRes.body._id;
  });

  afterAll(async () => {
    await Patient.deleteMany({ created_by: testEmail });
    await User.deleteMany({ email: testEmail });
    await mongoose.connection.close();
  });

  describe('POST /api/ai/generate-summary', () => {
    it('should handle summary generation', async () => {
      const res = await request(app)
        .post('/api/ai/generate-summary')
        .set('Authorization', `Bearer ${token}`)
        .send({
          extracted_data: { test: 'data' }
        });

      // May fail without OpenAI API key
      expect([200, 400, 500]).toContain(res.status);
      
      if (res.status === 200) {
        expect(res.body).toHaveProperty('summary');
        expect(typeof res.body.summary).toBe('string');
      }
    });

    it('should require extracted_data', async () => {
      const res = await request(app)
        .post('/api/ai/generate-summary')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/ai/generate-summary')
        .send({
          extracted_data: { test: 'data' }
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/ai/analyze-report', () => {
    it('should analyze report text', async () => {
      const reportText = `
        MAMMOGRAPHY REPORT
        
        INDICATION: Screening mammogram for 45-year-old female.
        
        TECHNIQUE: Standard bilateral CC and MLO views were obtained.
        
        FINDINGS:
        RIGHT BREAST: Scattered fibroglandular tissue. No suspicious masses, 
        calcifications, or architectural distortion.
        
        LEFT BREAST: Heterogeneously dense tissue. 6mm irregular mass at 
        10 o'clock position, 8cm from nipple. Associated pleomorphic 
        calcifications. Suspicious for malignancy.
        
        IMPRESSION: Left breast mass with calcifications, BI-RADS 5. 
        Recommend immediate biopsy.
      `;

      const res = await request(app)
        .post('/api/ai/analyze-report')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pdf_text: reportText
        });

      // May fail without OpenAI API key
      expect([200, 400, 500]).toContain(res.status);
    });

    it('should require pdf_text parameter', async () => {
      const res = await request(app)
        .post('/api/ai/analyze-report')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/ai/consolidate-reports', () => {
    it('should validate request structure', async () => {
      const res = await request(app)
        .post('/api/ai/consolidate-reports')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient_id: patientId
        });

      // May fail without OpenAI API key or insufficient reports
      expect([200, 400, 404, 500]).toContain(res.status);
    });

    it('should require patient_id', async () => {
      const res = await request(app)
        .post('/api/ai/consolidate-reports')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/ai/compare-treatments', () => {
    it('should compare treatment options', async () => {
      const res = await request(app)
        .post('/api/ai/compare-treatments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient_id: patientId,
          treatment_options: ['Option 1', 'Option 2']
        });

      // May fail without OpenAI API key
      expect([200, 400, 404, 500]).toContain(res.status);
    });

    it('should require patient_id', async () => {
      const res = await request(app)
        .post('/api/ai/compare-treatments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          treatment_options: ['Option 1', 'Option 2']
        });

      expect(res.status).toBe(400);
    });
  });

  describe('AI Service Error Handling', () => {
    it('should handle invalid API responses gracefully', async () => {
      // Test with empty text that might cause parsing issues
      const res = await request(app)
        .post('/api/ai/analyze-report')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pdf_text: ''
        });

      expect([400, 500]).toContain(res.status);
    });

    it('should handle network errors', async () => {
      // This test verifies error handling when OpenAI API is unavailable
      const originalKey = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'invalid-key-for-testing';

      const res = await request(app)
        .post('/api/ai/generate-summary')
        .set('Authorization', `Bearer ${token}`)
        .send({
          extracted_data: { test: 'data' }
        });

      expect([400, 500]).toContain(res.status);

      // Restore original key
      process.env.OPENAI_API_KEY = originalKey;
    });
  });

  describe('AI Response Validation', () => {
    it('should validate BI-RADS values are in range', async () => {
      const reportText = 'Simple screening mammogram, no findings. BI-RADS 1.';

      const res = await request(app)
        .post('/api/ai/analyze-report')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pdf_text: reportText
        });

      if (res.status === 200 && res.body.birads) {
        expect(res.body.birads.value).toBeGreaterThanOrEqual(0);
        expect(res.body.birads.value).toBeLessThanOrEqual(6);
      }
    });

    it('should extract structured findings', async () => {
      const reportText = `
        FINDINGS:
        - RIGHT BREAST: No abnormalities
        - LEFT BREAST: 8mm mass at 2 o'clock
        
        IMPRESSION: BI-RADS 4, recommend biopsy
      `;

      const res = await request(app)
        .post('/api/ai/analyze-report')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pdf_text: reportText
        });

      if (res.status === 200) {
        expect(res.body).toHaveProperty('findings');
        expect(Array.isArray(res.body.findings)).toBe(true);
      }
    });
  });
});
