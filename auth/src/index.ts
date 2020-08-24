import mongoose from 'mongoose';
import {app} from "./app";


async function start() {
    console.log('Starting auth service...');

    if (!process.env.JWT_KEY) {
        throw new Error('No JWT_KEY defined')
    }
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined")
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Connected to MongoDb');
    } catch (e) {
        console.error('Error connecting to db: ', e);
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000!');
    });

}

start();