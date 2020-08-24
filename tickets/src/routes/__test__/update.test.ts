import request from 'supertest';
import {app} from "../../app";
import mongoose from 'mongoose';
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/ticket";

it('should return 404 if the provided id does not exist', async function () {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'valid title',
            price: 20
        })
        .expect(404);
});

it('should return 401 if the user is not authenticated', async function () {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'valid title',
            price: 20
        })
        .expect(401);
});

it('should return 401 if the user does not own the ticket', async function () {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'valid',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'dsfasdfsad',
            price: 1000
        })
        .expect(401);
});

it('should return 400 if the user provides an invalid title or price', async function () {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'valid',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 20
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'valid',
            price: -10
        })
        .expect(400);
});

it('should update the ticket provided valid inputs', async function () {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'valid',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: 100
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();
    expect(ticketResponse.body.title).toEqual('new title');
    expect(ticketResponse.body.price).toEqual(100);
});

it('should publish an event', async function () {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'valid',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: 100
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('should reject update if the ticket is reserved', async function () {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'valid',
            price: 20
        });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId: mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'new title',
            price: 100
        })
        .expect(400);
});