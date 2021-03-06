import request from 'supertest';
import {app} from "../../app";
import mongoose from 'mongoose';
import {Order} from "../../models/order";
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper";
import {OrderStatus} from "@kosta111/common";

it('should return an error if the ticket does not exists', async function () {
    const ticketId = mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(404);
});

it('should return an error if the ticket is already reserved', async function () {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    const order = Order.build({
        ticket,
        expiresAt: new Date(),
        userId: 'randomId',
        status: OrderStatus.Created
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(400);
});

it('should reserve a ticket', async function () {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201)
});

it('should emit an order created event', async function () {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});