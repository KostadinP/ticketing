import {Publisher, Subjects, TicketUpdatedEvent} from "@kosta111/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject: TicketUpdatedEvent["subject"] = Subjects.TicketUpdated;
}