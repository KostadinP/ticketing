import {Listener, OrderCreatedEvent, Subjects} from "@kosta111/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    async onMessage(parsedData: OrderCreatedEvent["data"], msg: Message) {
        const order = Order.build({
            id: parsedData.id,
            price: parsedData.ticket.price,
            version: parsedData.version,
            status: parsedData.status,
            userId: parsedData.userId
        });
        await order.save();

        msg.ack();
    }

    queueGroupName: string = queueGroupName;
    readonly subject: OrderCreatedEvent["subject"] = Subjects.OrderCreated;

}