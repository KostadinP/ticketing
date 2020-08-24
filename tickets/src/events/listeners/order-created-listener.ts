import {Listener, OrderCreatedEvent, Subjects} from "@kosta111/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    async onMessage(parsedData: OrderCreatedEvent["data"], msg: Message) {
        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(parsedData.ticket.id);

        // if no ticket, throw error
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // mark ticket as reserved by setting the orderId property
        ticket.set({orderId: parsedData.id});
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        })

        // ack the message
        msg.ack();
    }

    queueGroupName: string = queueGroupName;
    readonly subject: OrderCreatedEvent["subject"] = Subjects.OrderCreated;

}