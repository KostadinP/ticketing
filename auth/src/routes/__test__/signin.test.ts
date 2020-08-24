import request from "supertest";
import {app} from "../../app";

it('should fail when an email that does not exist is supplied', async function () {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: "password"
        }).expect(400)
});

it('should fail when an incorrect password is supplied', async function () {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: "password"
        }).expect(201)

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: "password123"
        }).expect(400);
});

it('should respond with a cookie when give valid credentials', async function () {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: "password"
        }).expect(201)

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: "password"
        }).expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});