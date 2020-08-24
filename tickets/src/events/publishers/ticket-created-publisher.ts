import {Publisher, Subjects, TicketCreatedEvent} from "@kosta111/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject: TicketCreatedEvent["subject"] = Subjects.TicketCreated;
}