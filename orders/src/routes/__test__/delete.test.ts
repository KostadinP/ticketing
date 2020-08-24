import {Ticket} from "../../models/ticket";
import request from 'supertest';
import {app} from "../../app";
import {Order} from "../../models/order";
import {natsWrapper} from "../../nats-wrapper";
import mongoose from 'mongoose';
import {OrderStatus} from "@kosta111/common";

it('should mark an order as cancelled', async function () {
    // Create a ticket with Ticket model
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    const user = global.signin();
    // Make a request to create an order
    const {body: order} = await request(app)
        .post('/api/orders')
        .set("Cookie", user)
        .send({ticketId: ticket.id})
        .expect(201);

    // Make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(204);

    const updatedOrder = await Order.findById(order.id);
    // Expectation to make sure the thing is cancelled
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('should emit a order cancelled event', async function () {
    // Create a ticket with Ticket model
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    const user = global.signin();
    // Make a request to create an order
    const {body: order} = await request(app)
        .post('/api/orders')
        .set("Cookie", user)
        .send({ticketId: ticket.id})
        .expect(201);

    // Make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});