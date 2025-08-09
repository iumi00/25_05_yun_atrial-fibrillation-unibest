const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/user');

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('用户 API', () => {
  it('GET /users 应返回 200', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
  });
}); 