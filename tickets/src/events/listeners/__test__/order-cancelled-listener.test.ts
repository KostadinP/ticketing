import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from 'mongoose';
import {OrderCancelledEvent} from "@kosta111/common";
import {Message} from "node-nats-streaming";

async function setup() {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        userId: 'abc',
        title: 'concert',
        price: 30
    });
    ticket.set({orderId});
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {msg, data, ticket, orderId, listener};
}

it('should update the ticket, publish an event and ack the msg', async function () {
    const {msg, data, ticket, orderId, listener} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});