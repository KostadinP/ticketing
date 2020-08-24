import {PaymentCreatedEvent, Publisher, Subjects} from "@kosta111/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject: PaymentCreatedEvent["subject"] = Subjects.PaymentCreated;
}