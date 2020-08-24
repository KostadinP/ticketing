import express, {Request, Response} from "express";
import {BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest} from "@kosta111/common";
import {body} from "express-validator";
import {Ticket} from "../models/ticket";
import {natsWrapper} from "../nats-wrapper";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";

const router = express.Router();

router.put('/api/tickets/:id',
    requireAuth,
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('price').isFloat({gt: 0}).withMessage('Price is required and must be greater than 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            throw new NotFoundError();
        }
        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (!!ticket.orderId) {
            throw new BadRequestError('Cannot edit a reserved ticket');
        }

        const {title, price} = req.body;
        ticket.set({title, price});
        const newTicket = await ticket.save();
        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: newTicket.id,
            version: newTicket.version,
            title: newTicket.title,
            price: newTicket.price,
            userId: newTicket.userId
        });
        res.send(newTicket);
    });

export {router as updateTicketRouter}