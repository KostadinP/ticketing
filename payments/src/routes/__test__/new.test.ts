import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import {Order} from '../../models/order';
import {OrderStatus} from "@kosta111/common";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";


it('should 404 when purchasing order that does not exists', async function () {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdgsdgsd',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('should 401 when purchasing order that does not belong to the user', async function () {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        price: 20
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdgsdgsd',
            orderId: order.id
        })
        .expect(401);
});

it('should 400 when purchasing a cancelled order', async function () {
    const userId = mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        status: OrderStatus.Cancelled,
        price: 20
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asbcd',
            orderId: order.id
        })
        .expect(400);
});

it('should return a 201 with valid inputs', async function () {
    const userId = mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        status: OrderStatus.Created,
        price
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    const stripeCharges = await stripe.charges.list({limit: 50});
    const stripeCharge = stripeCharges.data.find(value => value.amount === price * 100);

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');

    const payment = await Payment.findOne({chargeId: stripeCharge!.id, orderId: order.id});
    expect(payment).toBeTruthy();
});