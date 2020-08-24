import {Listener, OrderStatus, PaymentCreatedEvent, Subjects} from "@kosta111/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    async onMessage(parsedData: PaymentCreatedEvent["data"], msg: Message) {
        const order = await Order.findById(parsedData.orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({status: OrderStatus.Complete});
        await order.save();

        msg.ack();
    }

    queueGroupName: string = queueGroupName;
    readonly subject: PaymentCreatedEvent["subject"] = Subjects.PaymentCreated;

}