import request from 'supertest'
import {app} from "../../app";

it('should respond with details about current user', async function () {
    const cookie = await global.signin();

    const response = await request(app)
        .get('/api/users/currentUser')
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com')
});

it('should respond with null if not authenticated', async function () {
    const response = await request(app)
        .get('/api/users/currentUser')
        .send()
        .expect(200);

    expect(response.body.currentUser).toEqual(null);
});