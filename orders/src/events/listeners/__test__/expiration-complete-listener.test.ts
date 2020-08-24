import {ExpirationCompleteListener} from "../expiration-complete-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Order} from "../../../models/order";
import {Ticket} from "../../../models/ticket";
import mongoose from 'mongoose';
import {ExpirationCompleteEvent, OrderStatus} from "@kosta111/common";
import {Message} from "node-nats-streaming";

async function setup() {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 20,
        title: 'concert'
    });
    await ticket.save();

    const order = Order.build({
        ticket,
        status: OrderStatus.Created,
        userId: 'asdaf',
        expiresAt: new Date()
    });
    await order.save();

    const data: ExpirationCompleteEvent["data"] = {
        orderId: order.id
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, ticket, order, data, msg};
}

it('should update the order status to cancelled', async function () {
    const {listener, ticket, order, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('should emit an order cancelled event', async function () {
    const {listener, ticket, order, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(eventData.id).toEqual(order.id);
});

it('should ack the message', async function () {
    const {listener, ticket, order, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});