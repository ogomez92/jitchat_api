import { Router, Request, Response, NextFunction } from 'express';
import retrieveUser from './retrieve_user';
import stats from './stats';
import decline from './decline';
import accept from './accept';
import newUser from './new_user';
import events from './events';

const router = Router();

router.use('/', retrieveUser)
.use('/', stats)
.use('/', newUser)
.use('/', events)
.use('/', accept)
.use('/', decline);

export default router;
