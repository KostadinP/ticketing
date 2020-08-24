import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose';
import * as process from "process";
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signin(): string[]
        }
    }
}

jest.mock('../nats-wrapper');


let mongo: MongoMemoryServer;
beforeAll(async () => {
    process.env.JWT_KEY = 'fasdsf';
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

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


global.signin = () => {
    // Build a JWT payload. {id, email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
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