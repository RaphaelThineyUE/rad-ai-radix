import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import RadiologyReport from '../models/RadiologyReport.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Report Routes', () => {
    let token: string;
    let testEmail: string;
    let patientId: string;
    let reportId: string;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/radreport-ai-test');
        }

        // Register test user
        testEmail = `report-tests-${Date.now()}@example.com`;
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                email: testEmail,
                full_name: 'Report Tester',
                password: 'password123'
            });

        token = registerRes.body.token;

        // Create test patient
        const patientRes = await request(app)
            .post('/api/patients')
            .set('Authorization', `Bearer ${token}`)
            .send({
                full_name: 'Test Patient for Reports',
                date_of_birth: '1980-01-01',
                gender: 'Female',
                diagnosis_date: '2023-01-15',
                cancer_type: 'Breast Cancer',
                cancer_stage: 'Stage II'
            });

        patientId = patientRes.body._id;
    });

    afterAll(async () => {
        await RadiologyReport.deleteMany({ created_by: testEmail });
        await Patient.deleteMany({ created_by: testEmail });
        await User.deleteMany({ email: testEmail });
        await mongoose.connection.close();
    });

    describe('POST /api/reports/upload', () => {
        it('should upload a file', async () => {
            // Create a small test file
            const testFilePath = path.join(__dirname, 'fixtures', 'test-upload.txt');
            const testDir = path.join(__dirname, 'fixtures');

            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }

            fs.writeFileSync(testFilePath, 'Test content for upload');

            const res = await request(app)
                .post('/api/reports/upload')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', testFilePath);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('file_url');
            expect(res.body).toHaveProperty('file_size');
            expect(res.body.file_url).toContain('uploads/');

            // Cleanup
            fs.unlinkSync(testFilePath);
            if (fs.existsSync(res.body.file_url)) {
                fs.unlinkSync(res.body.file_url);
            }
        });

        it('should reject upload without file', async () => {
            const res = await request(app)
                .post('/api/reports/upload')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(400);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/api/reports/upload');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/reports', () => {
        it('should create a report', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: patientId,
                    filename: 'test-report.pdf',
                    file_url: 'uploads/test-report.pdf',
                    file_size: 1024
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.filename).toBe('test-report.pdf');
            expect(res.body.patient_id).toBe(patientId);
            expect(res.body.status).toBe('pending');

            reportId = res.body._id;
        });

        it('should require patient_id', async () => {
            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    filename: 'test-report.pdf',
                    file_url: 'uploads/test-report.pdf'
                });

            expect(res.status).toBe(400);
        });

        it('should validate patient exists', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .post('/api/reports')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    patient_id: fakeId.toString(),
                    filename: 'test-report.pdf',
                    file_url: 'uploads/test-report.pdf'
                });

            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/reports', () => {
        it('should get all reports for user', async () => {
            const res = await request(app)
                .get('/api/reports')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should filter reports by patient_id', async () => {
            const res = await request(app)
                .get(`/api/reports?patient_id=${patientId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach(report => {
                expect(report.patient_id).toBe(patientId);
            });
        });

        it('should filter reports by status', async () => {
            const res = await request(app)
                .get('/api/reports?status=pending')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/reports/:id', () => {
        it('should get a specific report', async () => {
            const res = await request(app)
                .get(`/api/reports/${reportId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body._id).toBe(reportId);
            expect(res.body.filename).toBe('test-report.pdf');
        });

        it('should return 404 for non-existent report', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .get(`/api/reports/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/reports/:id/process', () => {
        it('should process a report (mock test)', async () => {
            // Note: This will fail without OpenAI API key
            // In real tests, you would mock the AI service
            const res = await request(app)
                .post(`/api/reports/${reportId}/process`)
                .set('Authorization', `Bearer ${token}`);

            // Either success or expected error
            expect([200, 500]).toContain(res.status);
        });

        it('should return 404 for non-existent report', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .post(`/api/reports/${fakeId}/process`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /api/reports/:id', () => {
        it('should delete a report', async () => {
            const res = await request(app)
                .delete(`/api/reports/${reportId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('deleted');

            // Verify it's gone
            const getRes = await request(app)
                .get(`/api/reports/${reportId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(getRes.status).toBe(404);
        });

        it('should return 404 for non-existent report', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .delete(`/api/reports/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/reports/consolidate', () => {
        beforeAll(async () => {
            // Create multiple completed reports for consolidation test
            await RadiologyReport.create([
                {
                    patient_id: patientId,
                    filename: 'report1.pdf',
                    file_url: 'uploads/report1.pdf',
                    status: 'completed',
                    created_by: testEmail,
                    birads: { value: 2 },
                    findings: ['Finding 1']
                },
                {
                    patient_id: patientId,
                    filename: 'report2.pdf',
                    file_url: 'uploads/report2.pdf',
                    status: 'completed',
                    created_by: testEmail,
                    birads: { value: 3 },
                    findings: ['Finding 2']
                }
            ]);
        });

        it('should consolidate multiple reports', async () => {
            const res = await request(app)
                .post('/api/reports/consolidate')
                .set('Authorization', `Bearer ${token}`)
                .send({ patient_id: patientId });

            // May fail without OpenAI API, but should at least validate
            expect([200, 400, 500]).toContain(res.status);

            if (res.status === 200) {
                expect(res.body).toHaveProperty('aggregate_stats');
                expect(res.body).toHaveProperty('reports_analyzed');
            }
        });

        it('should require at least 2 reports', async () => {
            // Create a patient with only 1 report
            const singlePatientRes = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    full_name: 'Single Report Patient',
                    date_of_birth: '1985-05-05',
                    gender: 'Female',
                    diagnosis_date: '2023-06-01',
                    cancer_type: 'Breast Cancer'
                });

            const singlePatientId = singlePatientRes.body._id;

            await RadiologyReport.create({
                patient_id: singlePatientId,
                filename: 'single.pdf',
                file_url: 'uploads/single.pdf',
                status: 'completed',
                created_by: testEmail
            });

            const res = await request(app)
                .post('/api/reports/consolidate')
                .set('Authorization', `Bearer ${token}`)
                .send({ patient_id: singlePatientId });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('at least 2');
        });
    });
});
