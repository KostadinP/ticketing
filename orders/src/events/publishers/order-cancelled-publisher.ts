import {OrderCancelledEvent, Publisher, Subjects} from "@kosta111/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject: OrderCancelledEvent["subject"] = Subjects.OrderCancelled;
}