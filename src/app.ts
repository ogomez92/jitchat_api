import express, { Request, Response, NextFunction } from "express";
import StorageManager from "./services/storage_manager";
import { helmetMiddleware, corsMiddleware, expressJsonMiddleware, morganMiddleware, urlencodedMiddleware} from './middleware';
import routes from './routes';


export const storageManager: StorageManager = new StorageManager();

const app = express();
app
.use(urlencodedMiddleware)
.use(helmetMiddleware)
.use(expressJsonMiddleware)
.use(corsMiddleware)
.use(morganMiddleware)
.use('', routes);

export default app;
