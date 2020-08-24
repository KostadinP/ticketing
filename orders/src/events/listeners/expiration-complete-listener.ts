import {ExpirationCompleteEvent, Listener, OrderStatus, Subjects} from "@kosta111/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    async onMessage(parsedData: ExpirationCompleteEvent["data"], msg: Message) {
        const order = await Order.findById(parsedData.orderId).populate('ticket');

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({status: OrderStatus.Cancelled});

        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        msg.ack();
    }

    queueGroupName: string = queueGroupName;
    readonly subject: ExpirationCompleteEvent["subject"] = Subjects.ExpirationComplete;

}