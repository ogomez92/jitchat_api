import { Router, Request, Response, NextFunction } from 'express';
import retrieveUser from './retrieve_user';
import onlineUsers from './online_users';
import decline from './decline';
import newUser from './new_user';
import events from './events';

const router = Router();

router.use('/', retrieveUser)
.use('/', onlineUsers)
.use('/', newUser)
.use('/', events)
.use('/', decline);

export default router;
