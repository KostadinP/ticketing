import {Listener, OrderCreatedEvent, Subjects} from "@kosta111/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {expirationQueue} from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    async onMessage(parsedData: OrderCreatedEvent["data"], msg: Message) {
        const delay = Date.parse(parsedData.expiresAt) - Date.now();
        console.log(`Delay is ${delay}`);
        await expirationQueue.add({
            orderId: parsedData.id
        }, {
            delay: delay
        })

        msg.ack();
    }


    queueGroupName: string = queueGroupName;
    readonly subject: OrderCreatedEvent["subject"] = Subjects.OrderCreated;

}