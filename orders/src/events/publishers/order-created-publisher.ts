import {OrderCreatedEvent, Publisher, Subjects} from "@kosta111/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject: OrderCreatedEvent["subject"] = Subjects.OrderCreated;
}