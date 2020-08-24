import {Listener, OrderCancelledEvent, OrderStatus, Subjects} from "@kosta111/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    async onMessage(parsedData: OrderCancelledEvent["data"], msg: Message) {
        const order = await Order.findOne({
            _id: parsedData.id,
            version: parsedData.version - 1
        });

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({status: OrderStatus.Cancelled});
        await order.save();

        msg.ack();
    }

    queueGroupName: string = queueGroupName;
    readonly subject: OrderCancelledEvent["subject"] = Subjects.OrderCancelled;

}