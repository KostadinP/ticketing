import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedEvent} from "@kosta111/common";
import mongoose from 'mongoose';
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";

async function setup() {
    // create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);

    // create a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    };

    // create a fake message object
    // @ts-ignore
    const message: Message = {
        ack: jest.fn()
    }

    return {listener, data, message};
}

it('should create and save a ticket', async function () {
    const {listener, data, message} = await setup();
    // call the onMessage function with the data + message object
    await listener.onMessage(data, message);

    //write assertions to make sure the ticket is created
    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('should ack the message', async function () {
    const {listener, data, message} = await setup();
    // call the onMessage function with the data + message object
    await listener.onMessage(data, message);

    // write assertions to make sure ack function is called
    expect(message.ack).toHaveBeenCalled();
});