import mongoose from 'mongoose';
import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import {TicketUpdatedEvent} from "@kosta111/common";
import {Message} from "node-nats-streaming";

async function setup() {
    // create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 30
    });
    await ticket.save();

    // create a fake data
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new title',
        price: 40,
        userId: 'abcd'
    }

    // create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    // return all of the stuff
    return {msg, data, ticket, listener};
}

it('should find update and save a ticket', async function () {
    const {msg, data, ticket, listener} = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('should ack the msg', async function () {
    const {msg, data, listener} = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('should not call ack if the event has a future version', async function () {
    const {msg, data, ticket, listener} = await setup();
    data.version++;
    try {
        await listener.onMessage(data, msg);
    } catch (e) {
    }

    expect(msg.ack).not.toHaveBeenCalled();
});