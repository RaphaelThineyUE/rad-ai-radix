import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

describe('Patient Routes', () => {
  let token: string;
  let testEmail: string;
  let patientId: string;
  let secondPatientId: string;

  const basePatient = {
    full_name: 'Test Patient',
    date_of_birth: '1980-01-01',
    gender: 'Female',
    diagnosis_date: '2023-01-15',
    cancer_type: 'Breast Cancer',
    cancer_stage: 'Stage II'
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/radreport-ai-test');
    }

    testEmail = `patient-tests-${Date.now()}@example.com`;
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        full_name: 'Patient Tester',
        password: 'password123'
      });

    token = registerRes.body.token;
  });

  afterAll(async () => {
    await Patient.deleteMany({ created_by: testEmail });
    await User.deleteMany({ email: testEmail });
    await mongoose.connection.close();
  });

  it('should create a patient', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send(basePatient);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('full_name', basePatient.full_name);
    expect(res.body).toHaveProperty('created_by', testEmail);

    patientId = res.body._id;
  });

  it('should list patients', async () => {
    const secondPatientRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...basePatient,
        full_name: 'Second Patient'
      });

    expect(secondPatientRes.status).toBe(201);
    expect(secondPatientRes.body).toHaveProperty('_id');
    expect(secondPatientRes.body).toHaveProperty('full_name', 'Second Patient');
    secondPatientId = secondPatientRes.body._id;

    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const ids = res.body.map((patient: { _id: string }) => patient._id);
    expect(ids).toEqual(expect.arrayContaining([patientId, secondPatientId]));
  });

  it('should read a patient', async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', patientId);
    expect(res.body).toHaveProperty('full_name', basePatient.full_name);
  });

  it('should update a patient', async () => {
    const res = await request(app)
      .patch(`/api/patients/${patientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ cancer_stage: 'Stage III' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', patientId);
    expect(res.body).toHaveProperty('cancer_stage', 'Stage III');
  });

  it('should delete a patient', async () => {
    const res = await request(app)
      .delete(`/api/patients/${secondPatientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Patient deleted successfully');

    const getRes = await request(app)
      .get(`/api/patients/${secondPatientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });
});
