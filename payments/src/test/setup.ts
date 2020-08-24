import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose';
import * as process from "process";
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signin(id?: string): string[]
        }
    }
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_51GyuplHyWrczaBJX9TjcAeRPTAtkP2l4oC0zspt6BDFbGrx5jPxuU57mxuawO11HOGxaJrnuMWMhkvSi1Kvkyjq8002PjwQcgp';


let mongo: MongoMemoryServer;
beforeAll(async () => {
    process.env.JWT_KEY = 'fasdsf';

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();
    console.log('Mongo uri', mongoUri);
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
})

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
})

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
})


global.signin = (id?: string) => {
    // Build a JWT payload. {id, email}
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!)

    // Build session Object. {jwt: my_jwt}
    const session = {jwt: token};

    // Turn session into JSON
    const sessionJson = JSON.stringify(session);

    // Take JSON and encode it in base64
    const base64 = Buffer.from(sessionJson).toString('base64');

    // return string that is the cookie with the encoded data
    return [`express:sess=${base64}`];
}