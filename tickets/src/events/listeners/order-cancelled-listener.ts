import {Listener, OrderCancelledEvent, Subjects} from "@kosta111/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    async onMessage(parsedData: OrderCancelledEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(parsedData.ticket.id);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.set({orderId: undefined});
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            orderId: ticket.orderId,
            userId: ticket.userId,
            title: ticket.title,
            price: ticket.price
        });

        msg.ack();
    }

    queueGroupName: string = queueGroupName;
    readonly subject: OrderCancelledEvent["subject"] = Subjects.OrderCancelled;
}