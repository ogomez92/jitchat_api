import express, { Request, Response, NextFunction } from "express";
import { compressionMiddleware, helmetMiddleware, corsMiddleware, expressJsonMiddleware, morganMiddleware, urlencodedMiddleware} from './middleware';
import routes from './routes';

const app = express();
app.use(compressionMiddleware)
.use(corsMiddleware)
.use(urlencodedMiddleware)
.use(helmetMiddleware)
.use(expressJsonMiddleware)
.use(morganMiddleware)
.use('/', routes);

export default app;
