import request from 'supertest';
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper";

it('should have a route handler listening to /api/tickets for post requests', async function () {
    const response = await request(app)
        .post('/api/tickets')
        .send({})
    expect(response.status).not.toEqual(404)
});
it('should only be accessed if the user is signed in', async function () {
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

it('should return status other than 401 if the user is signed in', async function () {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({})

    expect(response.status).not.toEqual(401);
});

it('should return an error if an invalid title is provided', async function () {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 10
        })
        .expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price: 10
        })
        .expect(400);
});
it('should return an error if an invalid price is provided', async function () {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'Valid title',
            price: -10
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'Valid title',
        })
        .expect(400);
});

it('should creat a ticket with valid input', async function () {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'Valid title';
    const price = 20;
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: title,
            price: price
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(price);
    expect(tickets[0].title).toEqual(title);
});

it('should publish an event', async function () {
    const title = 'Valid title';
    const price = 20;
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: title,
            price: price
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});