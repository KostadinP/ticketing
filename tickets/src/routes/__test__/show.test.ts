import request from 'supertest';
import {app} from "../../app";
import mongoose from 'mongoose';

it('should return 404 if the ticket is not found', async function () {
    const id = new mongoose.Types.ObjectId().toHexString();
    const response = await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404);
});

it('should return the ticket if the ticket is found', async function () {
    const title = 'Valid title';
    const price = 20;
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({title, price})
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});