import {Listener, Subjects, TicketUpdatedEvent} from "@kosta111/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    async onMessage(parsedData: TicketUpdatedEvent["data"], msg: Message) {
        const {id, price, title, version} = parsedData;

        const ticket = await Ticket.findByEvent(parsedData);
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        ticket.set({title, price});
        await ticket.save();

        msg.ack();
    }

    queueGroupName: string = queueGroupName;
    readonly subject: TicketUpdatedEvent["subject"] = Subjects.TicketUpdated;
}