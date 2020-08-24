import {Listener, Subjects, TicketCreatedEvent} from "@kosta111/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject: TicketCreatedEvent["subject"] = Subjects.TicketCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(parsedData: TicketCreatedEvent["data"], msg: Message) {
        const {id, title, price} = parsedData;

        const ticket = Ticket.build({
            title, price, id
        });
        await ticket.save();

        msg.ack();
    }

}