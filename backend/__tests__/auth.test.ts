import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/radreport-ai-test');
    }
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: /test.*@example\.com/ });
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test' + Date.now() + '@example.com',
          full_name: 'Test User',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email');
      expect(res.body.user).toHaveProperty('full_name', 'Test User');
    });

    it('should not register duplicate email', async () => {
      const email = 'test-duplicate' + Date.now() + '@example.com';
      
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          full_name: 'Test User',
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          full_name: 'Test User 2',
          password: 'password456'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid',
          password: '123'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    let testEmail;
    const testPassword = 'password123';

    beforeAll(async () => {
      testEmail = 'test-login' + Date.now() + '@example.com';
      await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail,
          full_name: 'Test Login User',
          password: testPassword
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testEmail);
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test-me' + Date.now() + '@example.com',
          full_name: 'Test Me User',
          password: 'password123'
        });
      token = res.body.token;
    });

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email');
      expect(res.body).toHaveProperty('full_name');
      expect(res.body).not.toHaveProperty('password_hash');
    });

    it('should not get user without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should not get user with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
    });
  });
});
