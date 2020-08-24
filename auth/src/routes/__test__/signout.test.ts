import request from 'supertest'
import {app} from "../../app";

it('should clear the cookie after signing out', async function () {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);


    const response = await request(app)
        .get('/api/users/signout')
        .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined()
});