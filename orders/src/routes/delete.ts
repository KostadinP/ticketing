import express from 'express';
import {NotAuthorizedError, NotFoundError, OrderStatus, requireAuth} from "@kosta111/common";
import {Order} from "../models/order";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.delete('/api/orders/:orderId',
    requireAuth,
    async (req, res) => {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId).populate('ticket');
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        order.status = OrderStatus.Cancelled;
        await order.save();

        // Publish an event saying this was canceled
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            ticket: {id: order.ticket.id},
            version: order.version
        })

        res.status(204).send(order);
    });

export {router as deleteOrderRouter}