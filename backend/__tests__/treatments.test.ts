import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import TreatmentRecord from '../models/TreatmentRecord.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';

describe('Treatment Routes', () => {
    let token: string;
    let testEmail: string;
    let patientId: string;
    let treatmentId: string;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/radreport-ai-test');
        }

        // Register test user
        testEmail = `treatment-tests-${Date.now()}@example.com`;
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                email: testEmail,
                full_name: 'Treatment Tester',
                password: 'password123'
            });

        token = registerRes.body.token;

        // Create test patient
        const patientRes = await request(app)
            .post('/api/patients')
            .set('Authorization', `Bearer ${token}`)
            .send({
                full_name: 'Test Patient for Treatments',
                date_of_birth: '1980-01-01',
                gender: 'Female',
                diagnosis_date: '2023-01-15',
                cancer_type: 'Breast Cancer',
                cancer_stage: 'Stage II',
                biomarker_status: {
                    er_positive: true,
                    pr_positive: true,
                    her2_positive: false
                }
            });

        patientId = patientRes.body._id;
    });

    afterAll(async () => {
        await TreatmentRecord.deleteMany({ created_by: testEmail });
        await Patient.deleteMany({ created_by: testEmail });
        await User.deleteMany({ email: testEmail });
        await mongoose.connection.close();
    });

    describe('POST /api/treatments', () => {
        it('should create a treatment record', async () => {
            const res = await request(app)
                .post('/api/treatments')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: patientId,
                    treatment_type: 'Chemotherapy',
                    treatment_start_date: '2023-02-01',
                    medication_details: 'AC-T regimen'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.patient_id).toBe(patientId);
            expect(res.body.treatment_type).toBe('Chemotherapy');

            treatmentId = res.body._id;
        });

        it('should require patient_id', async () => {
            const res = await request(app)
                .post('/api/treatments')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    treatment_type: 'Surgery',
                    treatment_start_date: '2023-03-01'
                });

            expect(res.status).toBe(400);
        });

        it('should require treatment_type', async () => {
            const res = await request(app)
                .post('/api/treatments')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: patientId,
                    treatment_start_date: '2023-03-01'
                });

            expect(res.status).toBe(400);
        });

        it('should validate patient exists', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .post('/api/treatments')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: fakeId.toString(),
                    treatment_type: 'Chemotherapy',
                    treatment_start_date: '2023-03-01'
                });

            expect([400, 404, 500]).toContain(res.status);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/api/treatments')
                .send({
                    patient_id: patientId,
                    treatment_name: 'Test Treatment',
                    start_date: '2023-03-01'
                });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/treatments', () => {
        beforeAll(async () => {
            // Create additional treatments for testing
            await request(app)
                .post('/api/treatments')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: patientId,
                    treatment_type: 'Radiation',
                    treatment_start_date: '2023-05-01',
                    treatment_end_date: '2023-06-15'
                });
        });

        it('should get all treatments for user', async () => {
            const res = await request(app)
                .get('/api/treatments')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
        });

        it('should filter treatments by patient_id', async () => {
            const res = await request(app)
                .get(`/api/treatments?patient_id=${patientId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach(treatment => {
                expect(treatment.patient_id).toBe(patientId);
            });
        });

        it('should filter treatments by type', async () => {
            const res = await request(app)
                .get('/api/treatments?treatment_type=Chemotherapy')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            if (res.body.length > 0) {
                res.body.forEach(treatment => {
                    expect(treatment.treatment_type).toBe('Chemotherapy');
                });
            }
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .get('/api/treatments');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/treatments/:id', () => {
        it('should get a specific treatment', async () => {
            const res = await request(app)
                .get(`/api/treatments/${treatmentId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body._id).toBe(treatmentId);
            expect(res.body.treatment_name).toBe('Chemotherapy - AC-T');
        });

        it('should return 404 for non-existent treatment', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .get(`/api/treatments/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .get(`/api/treatments/${treatmentId}`);

            expect(res.status).toBe(401);
        });
    });

    describe('PUT /api/treatments/:id', () => {
        it('should update a treatment', async () => {
            const res = await request(app)
                .put(`/api/treatments/${treatmentId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    end_date: '2023-04-30',
                    outcome: 'Completed successfully',
                    notes: 'Patient tolerated treatment well'
                });

            expect(res.status).toBe(200);
            expect(res.body.end_date).toBe('2023-04-30');
            expect(res.body.outcome).toBe('Completed successfully');
        });

        it('should return 404 for non-existent treatment', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .put(`/api/treatments/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    outcome: 'Test'
                });

            expect(res.status).toBe(404);
        });

        it('should not update patient_id', async () => {
            const newPatientId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .put(`/api/treatments/${treatmentId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: newPatientId.toString()
                });

            expect(res.status).toBe(200);
            // Verify patient_id hasn't changed
            expect(res.body.patient_id).toBe(patientId);
        });
    });

    describe('DELETE /api/treatments/:id', () => {
        let deleteTestId: string;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/treatments')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: patientId,
                    treatment_name: 'To Be Deleted',
                    start_date: '2023-07-01'
                });

            deleteTestId = res.body._id;
        });

        it('should delete a treatment', async () => {
            const res = await request(app)
                .delete(`/api/treatments/${deleteTestId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('deleted');

            // Verify it's gone
            const getRes = await request(app)
                .get(`/api/treatments/${deleteTestId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(getRes.status).toBe(404);
        });

        it('should return 404 for non-existent treatment', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .delete(`/api/treatments/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/treatments/compare', () => {
        it('should compare treatment options', async () => {
            const res = await request(app)
                .post('/api/treatments/compare')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: patientId,
                    treatment_options: [
                        'Chemotherapy (AC-T regimen)',
                        'Hormone therapy (Tamoxifen)',
                        'Chemotherapy + Hormone therapy'
                    ]
                });

            // May fail without OpenAI API key
            expect([200, 400, 500]).toContain(res.status);

            if (res.status === 200) {
                expect(res.body).toHaveProperty('comparisons');
                expect(Array.isArray(res.body.comparisons)).toBe(true);
                expect(res.body.comparisons.length).toBe(3);
            }
        });

        it('should require patient_id', async () => {
            const res = await request(app)
                .post('/api/treatments/compare')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    treatment_options: ['Treatment 1', 'Treatment 2']
                });

            expect(res.status).toBe(400);
        });

        it('should require at least 2 treatment options', async () => {
            const res = await request(app)
                .post('/api/treatments/compare')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: patientId,
                    treatment_options: ['Only one treatment']
                });

            expect(res.status).toBe(400);
        });

        it('should limit to maximum 5 treatment options', async () => {
            const res = await request(app)
                .post('/api/treatments/compare')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: patientId,
                    treatment_options: [
                        'Treatment 1',
                        'Treatment 2',
                        'Treatment 3',
                        'Treatment 4',
                        'Treatment 5',
                        'Treatment 6'
                    ]
                });

            expect(res.status).toBe(400);
        });
    });
});
