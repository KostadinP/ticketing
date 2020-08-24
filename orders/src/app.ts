import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser'
import cookieSession from 'cookie-session';
import {currentUser, errorHandler, NotFoundError} from "@kosta111/common";
import {indexOrderRouter} from "./routes";
import {deleteOrderRouter} from "./routes/delete";
import {showOrderRouter} from "./routes/show";
import {newOrderRouter} from "./routes/new";

const app = express();
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: false
}))
app.use(currentUser);

// Service Routes
app.use(indexOrderRouter);
app.use(deleteOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);

app.all('*', async () => {
    throw new NotFoundError();
})
app.use(errorHandler);

export {app}